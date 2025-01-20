import { isValidTransactionHash } from "../validateTransactionHash";

const generateTransactionPayload = (input, username) => {
    if (isValidTransactionHash(input.trim())) {
        return {
            userName: username,
            name: username,
            txhash: input.trim()
        };
    } else {
        return "Invalid transaction hash.";
    }
};

const formatTransactionReply = (data) => {
    return data.response.text;
};

export {
    generateTransactionPayload,
    formatTransactionReply
}