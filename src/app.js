const express = require("express");
const frontend = require("./frontend/app");
const api = require("./api/app");
const CampaignRepository = require("./api/campaign/repository");
const Ident = require("./ident/index");

module.exports = (db, mailer, hypeConfig) => {
    let app = express();

    let ident = Ident(db);
    let campaignRepository = CampaignRepository(db);

    app.use("/api", allowAllCrossOrigins, api(ident, campaignRepository, mailer, hypeConfig));
    app.use(frontend(campaignRepository, hypeConfig));
    return app;
};

function allowAllCrossOrigins(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type");
    next();
}
