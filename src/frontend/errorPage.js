module.exports = (code, message) => {
    if(!message) {
        message = "";
    }
    //TODO
    return `error ${code}: ${message}`;
};
