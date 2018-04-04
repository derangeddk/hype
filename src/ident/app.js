const express = require("express");
const bodyParser = require("body-parser");
const authenticationApp = require("./authentication/app");
const userApp = require("./user/app");

module.exports = (authRepository, userRepository) => {
    let app = express();

    app.use(bodyParser.json());
    
    app.use("/authenticate", authenticationApp(authRepository, userRepository));
    app.use("/user", userApp(userRepository, authRepository));

    app.use(function notFound(req, res) {
        res.status(404).send({ error: `Endpoint ${req.originalUrl} not found` });
    });

    return app;
};
