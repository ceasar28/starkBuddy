import React from "react";
import PageTemplate from "../components/PageTemplate";
import { formatInsightsReply, generateInsightsPayload } from "../utils/EndpointHelpers/generateInsightsPayload";

const InsightsPage = () => {
    return (
        <PageTemplate
            title="Token Insights"
            placeholder="Enter a contract address..."
            endpoint="https://app.eventblink.xyz/starkbuddy/1829d6bd-dd04-0e9f-9e38-f5be69bef551/token"
            generatePayload={generateInsightsPayload}
            formatReply={formatInsightsReply}
        />
    );
};

export default InsightsPage;