import React from "react";
import PageTemplate from "../components/PageTemplate";
import { formatTransactionReply, generateTransactionPayload } from "../utils/EndpointHelpers/generateTransactionPayload";

const TransactionPage = () => {
    return (
        <PageTemplate
            title="Transaction Details"
            placeholder="Enter a transaction hash..."
            endpoint="https://app.eventblink.xyz/starkbuddy/1829d6bd-dd04-0e9f-9e38-f5be69bef551/txhash"
            generatePayload={generateTransactionPayload}
            formatReply={formatTransactionReply}
        />
    );
};

export default TransactionPage;