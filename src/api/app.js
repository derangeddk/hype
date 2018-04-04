const express = require("express");
const bodyParser = require("body-parser");
const campaignApp = require("./campaign/app");
const Ident = require("../ident/index");

module.exports = (db) => {
    let app = express();
    let ident = Ident(db);

    app.use(bodyParser.json());
    
    app.use("/authenticate", ident.authentication.api);
    app.use("/user", ident.user.api);
    app.use("/campaign", campaignApp(db, ident.authentication.middleware));

    app.use(function notFound(req, res) {
        res.status(404).send({ error: `Endpoint ${req.originalUrl} not found` });
    });

    return app;
};
