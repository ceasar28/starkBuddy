import React from "react";
import PageTemplate from "../components/PageTemplate";
import { formatChatReply, generateChatPayload } from "../utils/EndpointHelpers/generateChatPayload";

const ChatPage = () => {
    return (
        <PageTemplate
            title="Chat with StarkBuddy"
            placeholder="Ask anything..."
            endpoint="https://app.eventblink.xyz/starkbuddy/1829d6bd-dd04-0e9f-9e38-f5be69bef551/message"
            generatePayload={generateChatPayload}
            formatReply={formatChatReply}
        />
    );
};

export default ChatPage;