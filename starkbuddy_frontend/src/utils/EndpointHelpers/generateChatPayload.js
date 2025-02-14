const generateChatPayload = (input, username) => {
    return {
        userName: username,
        name: username,
        text: input
    };
};

const formatChatReply = (data) => {
    return data[0].text;
};

export {
    generateChatPayload,
    formatChatReply
}