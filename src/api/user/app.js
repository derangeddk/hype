const express = require("express");
const ensureDb = require("../ensureDb");
const authenticationMiddleware = require("../authentication/middleware");
const createNewUser = require("./createNewUser");
const listEndpoint = require("./list/endpoint");
const createEndpoint = require("./create/endpoint");
const updateEndpoint = require("./update/endpoint");
const deleteEndpoint = require("./delete/endpoint");

module.exports = (db) => {
    let app = express();

    //ensure users db
    ensureDb(db, "users (username text NOT NULL, data json NOT NULL)", {
        onCreate: (callback) => createNewUser(db, "admin", "admin", "Admin User", "nil@admin", callback)
    }, (error) => {
        if(error) {
            console.error("Failed to ensure users db", error);
            process.exit(1);
        }
    });

    //auth all
    app.use(authenticationMiddleware(db));

    //endpoints
    app.get("/", listEndpoint(db));
    app.post("/", createEndpoint(db));
    app.put("/:username", updateEndpoint(db));
    app.delete("/:username", deleteEndpoint(db));

    return app;
};
