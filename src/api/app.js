const express = require("express");
const bodyParser = require("body-parser");
const campaignApp = require("./campaign/app");
const emailApp = require("./email/app");

module.exports = (ident, campaignRepository, mailer, hypeConfig) => {
    let app = express();

    app.use(bodyParser.json());
    
    app.use("/authenticate", ident.authentication.api);
    app.use("/user", ident.user.api);
    app.use("/campaign", campaignApp(campaignRepository, ident.authentication.middleware, mailer, hypeConfig));
    app.use("/email", ident.authentication.middleware, emailApp(campaignRepository, mailer, hypeConfig));

    app.use(function notFound(req, res) {
        res.status(404).send({ error: `Endpoint ${req.originalUrl} not found` });
    });

    return app;
};
