const generateUniqueUsername = () => {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `user_${timestamp}_${randomSuffix}`;
};

const getOrCreateUsername = () => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
        return storedUsername;
    } else {
        const newUsername = generateUniqueUsername();
        localStorage.setItem("username", newUsername);
        return newUsername;
    }
};  

export {
    getOrCreateUsername
}