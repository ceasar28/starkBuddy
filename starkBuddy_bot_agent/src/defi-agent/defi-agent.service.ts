import { Injectable } from '@nestjs/common';
import { StarknetAgent } from 'starknet-agent-kit';
import { RpcProvider } from 'starknet';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

@Injectable()
export class DefiAgentService {
  private readonly starkAgent: StarknetAgent;
  constructor() {
    this.starkAgent = new StarknetAgent({
      provider: new RpcProvider({ nodeUrl: process.env.RPC_URL }),
      accountPrivateKey: process.env.PRIVATE_KEY,
      accountPublicKey: process.env.PUBLIC_ADDRESS,
      aiProvider: 'openai',
      aiModel: 'gpt-4o-mini',
      aiProviderApiKey: process.env.AI_PROVIDER_API_KEY,
      signature: 'key',
      agentMode: 'agent',
    });
  }

  async swapToken(prompt: string) {
    try {
      const llmPrompt = `You are an AI agent specializing in the Starknet ecosystem. Provide a clear, concise, and accurate response to the following message: ${prompt}`;

      const result = await generateText({
        model: openai('gpt-4o-mini'),
        maxSteps: 10,
        prompt: llmPrompt,
        onStepFinish: (event) => {
          console.log(event.toolResults);
        },
      });

      return { response: result.text };
    } catch (error) {
      console.log(error);
    }
  }

  async analyzeToken(contract: string) {
    try {
      const geckoUrl = `https://api.geckoterminal.com/api/v2/networks/starknet-alpha/tokens/${contract}`;
      const urls = [`${geckoUrl}`];

      // Fetch all data concurrently
      const [tokenData] = await Promise.all(
        urls.map((url) =>
          fetch(url, { method: 'GET' }).then((response) => response.json()),
        ),
      );

      // Respond with the collected data
      const tokenAnalyticData = {
        address: tokenData.data.attributes.address,
        name: tokenData.data.attributes.name,
        symbol: tokenData.data.attributes.symbol,
        decimal: tokenData.data.attributes.decimal,
        total_supply: tokenData.data.attributes.total_supply,
        price_usd: tokenData.data.attributes.price_usd,
        fully_Diluted_Valuation:
          tokenData.data.attributes.fdv_usd ||
          parseFloat(tokenData.data.attributes.price_usd) *
            parseFloat(tokenData.data.attributes.price_usd),
        market_cap_usd: tokenData.data.attributes.market_cap_usd,
        volume_usd: tokenData.data.attributes.volume_usd.h24,
      };

      const prompt = `You are an AI agent specializing in Token sentiment analysis. Your task is to analyze a token based on the provided on-chain data and generate detailed  market sentiment analysis in this format:
      Name of token, symbol, price, Number of holders, FDV, and 24hr volume  Please present the response in a structured  markdown format,for a crypto trader.

Here is the token data:
- Token Name: ${tokenAnalyticData.name}  
- Symbol: ${tokenAnalyticData.symbol}  
- Contract Address: ${tokenAnalyticData.address}  
- Decimals: ${tokenAnalyticData.decimal}  
- Total Supply: ${tokenAnalyticData.total_supply}  
- Current Price (USD): $${tokenAnalyticData.price_usd}  
- Fully Diluted Valuation (FDV): $${tokenAnalyticData.fully_Diluted_Valuation}  
${tokenAnalyticData.market_cap_usd ? `- **Market Cap (USD)**: $${tokenAnalyticData.market_cap_usd}` : ''}  
- 24h Trading Volume (USD): $${tokenAnalyticData.volume_usd || 'Data Missing'}  
`;

      const result = await generateText({
        model: openai('gpt-4o-mini'),
        maxSteps: 10,
        prompt: prompt,
        onStepFinish: (event) => {
          console.log(event.toolResults);
        },
      });

      return { insight: result.text };
    } catch (error) {
      console.log(error);
    }
  }
}
