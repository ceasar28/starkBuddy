import { isValidTokenAddress } from "../validateContractAddress";

const generateInsightsPayload = (input, username) => {
    // if (isValidTokenAddress(input.trim())) {
        return {
            userName: username,
            name: username,
            tokenAddress: input.trim()
        };
    // } else {
    //     return "Invalid address.";
    // }
};

const formatInsightsReply = (data) => {
    return data.response.text;
};

export {
    generateInsightsPayload,
    formatInsightsReply
}