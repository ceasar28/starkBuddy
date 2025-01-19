import bodyParser from "body-parser";
import cors from "cors";
import express, { Request as ExpressRequest } from "express";
import multer, { File } from "multer";
import { elizaLogger, generateCaption, generateImage } from "@ai16z/eliza";
import { composeContext } from "@ai16z/eliza";
import { generateMessageResponse } from "@ai16z/eliza";
import { messageCompletionFooter } from "@ai16z/eliza";
import { AgentRuntime } from "@ai16z/eliza";
import {
    Content,
    Memory,
    ModelClass,
    Client,
    IAgentRuntime,
} from "@ai16z/eliza";
import { stringToUuid } from "@ai16z/eliza";
import { settings } from "@ai16z/eliza";
import { createApiRouter } from "./api.ts";
import * as fs from "fs";
import * as path from "path";
const upload = multer({ storage: multer.memoryStorage() });

export const messageHandlerTemplate =
    // {{goals}}
    `# Action Examples
{{actionExamples}}
(Action examples are for reference only. Do not use the information from them in your response.)

# Knowledge
{{knowledge}}

# Task: Generate dialog and actions for the character {{agentName}}.
About {{agentName}}:
{{bio}}
{{lore}}

{{providers}}

{{attachments}}

# Capabilities
Note that {{agentName}} is capable of reading/seeing/hearing various forms of media, including images, videos, audio, plaintext and PDFs. Recent attachments have been included above under the "Attachments" section.

{{messageDirections}}

{{recentMessages}}

{{actions}}

# Instructions: Write the next message for {{agentName}}.
` + messageCompletionFooter;

export interface SimliClientConfig {
    apiKey: string;
    faceID: string;
    handleSilence: boolean;
    videoRef: any;
    audioRef: any;
}
export class DirectClient {
    public app: express.Application;
    private agents: Map<string, AgentRuntime>;
    private server: any; // Store server instance

    constructor() {
        elizaLogger.log("DirectClient constructor");
        this.app = express();
        this.app.use(cors());
        this.agents = new Map();

        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));

        const apiRouter = createApiRouter(this.agents);
        this.app.use(apiRouter);

        // Define an interface that extends the Express Request interface
        interface CustomRequest extends ExpressRequest {
            file: File;
        }

        // Update the route handler to use CustomRequest instead of express.Request
        this.app.post(
            "/:agentId/whisper",
            upload.single("file"),
            async (req: CustomRequest, res: express.Response) => {
                const audioFile = req.file; // Access the uploaded file using req.file
                const agentId = req.params.agentId;

                if (!audioFile) {
                    res.status(400).send("No audio file provided");
                    return;
                }

                let runtime = this.agents.get(agentId);

                // if runtime is null, look for runtime with the same name
                if (!runtime) {
                    runtime = Array.from(this.agents.values()).find(
                        (a) =>
                            a.character.name.toLowerCase() ===
                            agentId.toLowerCase()
                    );
                }

                if (!runtime) {
                    res.status(404).send("Agent not found");
                    return;
                }

                const formData = new FormData();
                const audioBlob = new Blob([audioFile.buffer], {
                    type: audioFile.mimetype,
                });
                formData.append("file", audioBlob, audioFile.originalname);
                formData.append("model", "whisper-1");

                const response = await fetch(
                    "https://api.openai.com/v1/audio/transcriptions",
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${runtime.token}`,
                        },
                        body: formData,
                    }
                );

                const data = await response.json();
                res.json(data);
            }
        );

        this.app.post(
            "/:agentId/message",
            async (req: express.Request, res: express.Response) => {
                const agentId = req.params.agentId;
                const roomId = stringToUuid(
                    req.body.roomId ?? "default-room-" + agentId
                );
                const userId = stringToUuid(req.body.userId ?? "user");

                let runtime = this.agents.get(agentId);

                // if runtime is null, look for runtime with the same name
                if (!runtime) {
                    runtime = Array.from(this.agents.values()).find(
                        (a) =>
                            a.character.name.toLowerCase() ===
                            agentId.toLowerCase()
                    );
                }

                if (!runtime) {
                    res.status(404).send("Agent not found");
                    return;
                }

                await runtime.ensureConnection(
                    userId,
                    roomId,
                    req.body.userName,
                    req.body.name,
                    "direct"
                );

                const text = req.body.text;
                const messageId = stringToUuid(Date.now().toString());

                const content: Content = {
                    text,
                    attachments: [],
                    source: "direct",
                    inReplyTo: undefined,
                };

                const userMessage = {
                    content,
                    userId,
                    roomId,
                    agentId: runtime.agentId,
                };

                const memory: Memory = {
                    id: messageId,
                    agentId: runtime.agentId,
                    userId,
                    roomId,
                    content,
                    createdAt: Date.now(),
                };

                await runtime.messageManager.createMemory(memory);

                const state = await runtime.composeState(userMessage, {
                    agentName: runtime.character.name,
                });

                const context = composeContext({
                    state,
                    template: messageHandlerTemplate,
                });

                const response = await generateMessageResponse({
                    runtime: runtime,
                    context,
                    modelClass: ModelClass.SMALL,
                });

                // save response to memory
                const responseMessage = {
                    ...userMessage,
                    userId: runtime.agentId,
                    content: response,
                };

                await runtime.messageManager.createMemory(responseMessage);

                if (!response) {
                    res.status(500).send(
                        "No response from generateMessageResponse"
                    );
                    return;
                }

                let message = null as Content | null;

                await runtime.evaluate(memory, state);

                const _result = await runtime.processActions(
                    memory,
                    [responseMessage],
                    state,
                    async (newMessages) => {
                        message = newMessages;
                        return [memory];
                    }
                );

                if (message) {
                    res.json([response, message]);
                } else {
                    res.json([response]);
                }
            }
        );

        this.app.post(
            "/:agentId/image",
            async (req: express.Request, res: express.Response) => {
                const agentId = req.params.agentId;
                const agent = this.agents.get(agentId);
                if (!agent) {
                    res.status(404).send("Agent not found");
                    return;
                }

                const images = await generateImage({ ...req.body }, agent);
                const imagesRes: { image: string; caption: string }[] = [];
                if (images.data && images.data.length > 0) {
                    for (let i = 0; i < images.data.length; i++) {
                        const caption = await generateCaption(
                            { imageUrl: images.data[i] },
                            agent
                        );
                        imagesRes.push({
                            image: images.data[i],
                            caption: caption.title,
                        });
                    }
                }
                res.json({ images: imagesRes });
            }
        );

        this.app.post(
            "/fine-tune",
            async (req: express.Request, res: express.Response) => {
                try {
                    const response = await fetch(
                        "https://api.bageldb.ai/api/v1/asset",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "X-API-KEY": `${process.env.BAGEL_API_KEY}`,
                            },
                            body: JSON.stringify(req.body),
                        }
                    );

                    const data = await response.json();
                    res.json(data);
                } catch (error) {
                    res.status(500).json({
                        error: "Please create an account at bakery.bagel.net and get an API key. Then set the BAGEL_API_KEY environment variable.",
                        details: error.message,
                    });
                }
            }
        );
        this.app.get(
            "/fine-tune/:assetId",
            async (req: express.Request, res: express.Response) => {
                const assetId = req.params.assetId;
                const downloadDir = path.join(
                    process.cwd(),
                    "downloads",
                    assetId
                );

                console.log("Download directory:", downloadDir);

                try {
                    console.log("Creating directory...");
                    await fs.promises.mkdir(downloadDir, { recursive: true });

                    console.log("Fetching file...");
                    const fileResponse = await fetch(
                        `https://api.bageldb.ai/api/v1/asset/${assetId}/download`,
                        {
                            headers: {
                                "X-API-KEY": `${process.env.BAGEL_API_KEY}`,
                            },
                        }
                    );

                    if (!fileResponse.ok) {
                        throw new Error(
                            `API responded with status ${fileResponse.status}: ${await fileResponse.text()}`
                        );
                    }

                    console.log("Response headers:", fileResponse.headers);

                    const fileName =
                        fileResponse.headers
                            .get("content-disposition")
                            ?.split("filename=")[1]
                            ?.replace(/"/g, "") || "default_name.txt";

                    console.log("Saving as:", fileName);

                    const arrayBuffer = await fileResponse.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);

                    const filePath = path.join(downloadDir, fileName);
                    console.log("Full file path:", filePath);

                    await fs.promises.writeFile(filePath, buffer);

                    // Verify file was written
                    const stats = await fs.promises.stat(filePath);
                    console.log(
                        "File written successfully. Size:",
                        stats.size,
                        "bytes"
                    );

                    res.json({
                        success: true,
                        message: "Single file downloaded successfully",
                        downloadPath: downloadDir,
                        fileCount: 1,
                        fileName: fileName,
                        fileSize: stats.size,
                    });
                } catch (error) {
                    console.error("Detailed error:", error);
                    res.status(500).json({
                        error: "Failed to download files from BagelDB",
                        details: error.message,
                        stack: error.stack,
                    });
                }
            }
        );
        this.app.post(
            "/:agentId/post",
            async (req: express.Request, res: express.Response) => {
                try {
                    const agentId = req.params.agentId;
                    const roomId = stringToUuid(
                        req.body.roomId ?? "default-room-" + agentId
                    );
                    const userId = stringToUuid(req.body.userId ?? "user");

                    let runtime = this.agents.get(agentId);

                    // if runtime is null, look for runtime with the same name
                    if (!runtime) {
                        runtime = Array.from(this.agents.values()).find(
                            (a) =>
                                a.character.name.toLowerCase() ===
                                agentId.toLowerCase()
                        );
                    }

                    if (!runtime) {
                        res.status(404).send("Agent not found");
                        return;
                    }

                    await runtime.ensureConnection(
                        userId,
                        roomId,
                        req.body.userName,
                        req.body.name,
                        "direct"
                    );

                    const text = `Generate random tweets, each no more than 180 characters, written in the style of a conservative politician. The tweets should reflect strength, vision, and principles while maintaining a confident and assertive tone. Avoid starting with phrases like ‘In a’ or ‘Here’s a.’ Do not ask questions or include hashtags. Each tweet should embody the character of a real person sharing a thought, opinion, or message, focused on values, leadership, and patriotism.`;
                    const messageId = stringToUuid(Date.now().toString());

                    const content: Content = {
                        text,
                        attachments: [],
                        source: "direct",
                        inReplyTo: undefined,
                    };

                    const userMessage = {
                        content,
                        userId,
                        roomId,
                        agentId: runtime.agentId,
                    };

                    const memory: Memory = {
                        id: messageId,
                        agentId: runtime.agentId,
                        userId,
                        roomId,
                        content,
                        createdAt: Date.now(),
                    };

                    await runtime.messageManager.createMemory(memory);

                    const state = await runtime.composeState(userMessage, {
                        agentName: runtime.character.name,
                    });

                    const context = composeContext({
                        state,
                        template: messageHandlerTemplate,
                    });

                    const response = await generateMessageResponse({
                        runtime: runtime,
                        context,
                        modelClass: ModelClass.SMALL,
                    });

                    // save response to memory
                    const responseMessage = {
                        ...userMessage,
                        userId: runtime.agentId,
                        content: response,
                    };

                    await runtime.messageManager.createMemory(responseMessage);

                    if (!response) {
                        res.status(500).send(
                            "No response from generateMessageResponse"
                        );
                        return;
                    }

                    let message = null as Content | null;

                    await runtime.evaluate(memory, state);

                    const _result = await runtime.processActions(
                        memory,
                        [responseMessage],
                        state,
                        async (newMessages) => {
                            message = newMessages;
                            return [memory];
                        }
                    );

                    if (message) {
                        res.json({ response, message });
                    } else {
                        res.json({ response });
                    }
                } catch (error) {
                    console.error(error);
                    res.status(500).json({
                        error,
                        details: error.message,
                    });
                }
            }
        );

        this.app.post(
            "/:agentId/txhash",
            async (req: express.Request, res: express.Response) => {
                try {
                    const apiKEY = process.env.ALCHEMY_KEY;
                    // Prepare URLs for fetch calls
                    const baseUrl = `https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_7/${apiKEY}`;
                    const hash = req.body.txhash?.trim();

                    if (!hash) {
                        res.status(400).json({ error: " hash is required." });
                        return;
                    }
                    const payload = {
                        id: 1,
                        jsonrpc: "2.0",
                        method: "starknet_getTransactionReceipt",
                        params: [hash],
                    };

                    const receiptResponse = await fetch(baseUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    });

                    const txnReceipts = await receiptResponse.json();

                    const agentId = req.params.agentId;
                    const roomId = stringToUuid(
                        req.body.roomId ?? "default-room-" + agentId
                    );
                    const userId = stringToUuid(req.body.userId ?? "user");

                    let runtime = this.agents.get(agentId);

                    // if runtime is null, look for runtime with the same name
                    if (!runtime) {
                        runtime = Array.from(this.agents.values()).find(
                            (a) =>
                                a.character.name.toLowerCase() ===
                                agentId.toLowerCase()
                        );
                    }

                    if (!runtime) {
                        res.status(404).send("Agent not found");
                        return;
                    }

                    await runtime.ensureConnection(
                        userId,
                        roomId,
                        req.body.userName,
                        req.body.name,
                        "direct"
                    );

                    const text = `You are an AI agent specializing in StarkNet blockchain analysis. Your task is to analyze a transaction receipt based on the provided JSON data and generate detailed insights, key findings, and recommendations. Please present the response in a structured format.

Here is the transaction receipt:
- Transaction Receipt from the Blockchain: ${txnReceipts}
- JSON-RPC Version: ${txnReceipts.jsonrpc}
- ID: ${txnReceipts.id}
- Actual Fee: ${txnReceipts.result.actual_fee.amount} (in WEI)
- Block Hash: ${txnReceipts.result.block_hash}
- Block Number: ${txnReceipts.result.block_number}
- Events: ${JSON.stringify(txnReceipts.result.events, null, 2)}

Please provide the following:
1. **Field-by-Field Breakdown**:  
   - Explain the purpose and significance of each field in the JSON (e.g., actual_fee, block_hash, block_number, events, etc.).
   - Convert values in hexadecimal (e.g., fees, data fields) into readable formats like ETH or USD where applicable.  

2. **Event Analysis**:  
   - Break down the \`events\` array, explain each \`data\` field, and describe its relevance to the transaction.
   - Include insights into \`from_address\` and the significance of \`keys\`.

3. **Key Insights**:  
   - Summarize what this receipt reveals about the transaction.
   - Discuss the fees, efficiency, or any anomalies observed.

4. **Actionable Recommendations**:  
   - Provide advice for developers or users analyzing similar transactions.
   - Suggest tools or frameworks for further analysis of StarkNet transactions.

Use a concise, professional tone and present your findings in an organized manner.`;
                    const messageId = stringToUuid(Date.now().toString());

                    const content: Content = {
                        text,
                        attachments: [],
                        source: "direct",
                        inReplyTo: undefined,
                    };

                    const userMessage = {
                        content,
                        userId,
                        roomId,
                        agentId: runtime.agentId,
                    };

                    const memory: Memory = {
                        id: messageId,
                        agentId: runtime.agentId,
                        userId,
                        roomId,
                        content,
                        createdAt: Date.now(),
                    };

                    await runtime.messageManager.createMemory(memory);

                    const state = await runtime.composeState(userMessage, {
                        agentName: runtime.character.name,
                    });

                    const context = composeContext({
                        state,
                        template: messageHandlerTemplate,
                    });

                    const response = await generateMessageResponse({
                        runtime: runtime,
                        context,
                        modelClass: ModelClass.SMALL,
                    });

                    // save response to memory
                    const responseMessage = {
                        ...userMessage,
                        userId: runtime.agentId,
                        content: response,
                    };

                    await runtime.messageManager.createMemory(responseMessage);

                    if (!response) {
                        res.status(500).send(
                            "No response from generateMessageResponse"
                        );
                        return;
                    }

                    let message = null as Content | null;

                    await runtime.evaluate(memory, state);

                    const _result = await runtime.processActions(
                        memory,
                        [responseMessage],
                        state,
                        async (newMessages) => {
                            message = newMessages;
                            return [memory];
                        }
                    );

                    if (message) {
                        res.json({
                            response,
                            message,
                        });
                    } else {
                        res.json({ response });
                    }
                } catch (error) {
                    console.error(error);
                    res.status(500).json({
                        error,
                        details: error.message,
                    });
                }
            }
        );

        this.app.get("/ping", (req: express.Request, res: express.Response) => {
            res.json({
                success: true,
                message: "Server is alive and running!",
            });
        });
    }

    public registerAgent(runtime: AgentRuntime) {
        this.agents.set(runtime.agentId, runtime);
    }

    public unregisterAgent(runtime: AgentRuntime) {
        this.agents.delete(runtime.agentId);
    }

    public start(port: number) {
        this.server = this.app.listen(port, () => {
            elizaLogger.success(`Server running at http://localhost:${port}/`);
        });

        // Handle graceful shutdown
        const gracefulShutdown = () => {
            elizaLogger.log("Received shutdown signal, closing server...");
            this.server.close(() => {
                elizaLogger.success("Server closed successfully");
                process.exit(0);
            });

            // Force close after 5 seconds if server hasn't closed
            setTimeout(() => {
                elizaLogger.error(
                    "Could not close connections in time, forcefully shutting down"
                );
                process.exit(1);
            }, 5000);
        };

        // Handle different shutdown signals
        process.on("SIGTERM", gracefulShutdown);
        process.on("SIGINT", gracefulShutdown);
    }

    public stop() {
        if (this.server) {
            this.server.close(() => {
                elizaLogger.success("Server stopped");
            });
        }
    }
}

export const DirectClientInterface: Client = {
    start: async (_runtime: IAgentRuntime) => {
        elizaLogger.log("DirectClientInterface start");
        const client = new DirectClient();
        const serverPort = parseInt(settings.SERVER_PORT || "3000");
        client.start(serverPort);
        return client;
    },
    stop: async (_runtime: IAgentRuntime, client?: any) => {
        if (client instanceof DirectClient) {
            client.stop();
        }
    },
};

export default DirectClientInterface;
