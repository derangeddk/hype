module.exports = (db) => {
    let userRepository = require("./user/repository")(db);
    let authRepository = require("./authentication/repository")(db);

    return {
        api: require("./app")(authRepository, userRepository),
        authentication: {
            api: require("./authentication/app")(authRepository, userRepository),
            middleware: require("./authentication/middleware")(authRepository),
            repository: authRepository
        },
        user: {
            api: require("./user/app")(userRepository, authRepository),
            repository: userRepository
        },
        generateSalt: require("./authentication/generateSalt"),
        hashPassword: require("./authentication/hashPassword")
    };
};
