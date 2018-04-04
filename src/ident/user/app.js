const express = require("express");
const authenticationMiddleware = require("../authentication/middleware");
const listEndpoint = require("./list/endpoint");
const createEndpoint = require("./create/endpoint");
const updateEndpoint = require("./update/endpoint");
const deleteEndpoint = require("./delete/endpoint");

module.exports = (userRepository, authRepository) => {
    let app = express();

    //auth all
    app.use(authenticationMiddleware(authRepository));

    //endpoints
    app.get("/", listEndpoint(userRepository));
    app.post("/", createEndpoint(userRepository));
    app.put("/:username", updateEndpoint(userRepository));
    app.delete("/:username", deleteEndpoint(userRepository));

    return app;
};
