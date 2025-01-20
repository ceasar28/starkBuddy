const isValidTokenAddress = (address) => {
    const transactionHashRegex = /^0x([A-Fa-f0-9]{64})$/;
    return transactionHashRegex.test(address);
};

export {
    isValidTokenAddress
}