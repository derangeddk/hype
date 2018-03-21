const express = require("express");
const bodyParser = require("body-parser");
const campaignApp = require("./campaign/app");
const authenticationApp = require("./authentication/app");
const userApp = require("./user/app");

module.exports = (db) => {
    let app = express();

    app.use(bodyParser.json());
    
    app.use("/authenticate", authenticationApp(db));
    app.use("/user", userApp(db));
    app.use("/campaign", campaignApp(db));

    app.use(function notFound(req, res) {
        res.status(404).send({ error: `Endpoint ${req.originalUrl} not found` });
    });

    return app;
};
