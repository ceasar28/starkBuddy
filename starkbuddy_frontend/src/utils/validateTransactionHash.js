const isValidTransactionHash = (hash) => {
    const transactionHashRegex = /^0x([A-Fa-f0-9]{64})$/;
    return transactionHashRegex.test(hash);
};

export {
    isValidTransactionHash
}