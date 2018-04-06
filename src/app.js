const express = require("express");
const frontend = require("./frontend/app");
const api = require("./api/app");
const CampaignRepository = require("./api/campaign/repository");
const Ident = require("./ident/index");

module.exports = (db, mailer, hypeConfig) => {
    let app = express();

    let ident = Ident(db);
    let campaignRepository = CampaignRepository(db);

    app.use("/api", api(ident, campaignRepository, mailer, hypeConfig));
    app.use(frontend(campaignRepository, hypeConfig));
    return app;
};
