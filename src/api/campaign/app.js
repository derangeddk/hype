const express = require("express");
const createEndpoint = require("./create/endpoint");
const subscribeEndpoint = require("./subscribe/endpoint");
const updateSubscriptionEndpoint = require("./update-subscription/endpoint");
const listCampaignsEndpoint = require("./list-campaigns/endpoint");
const listSubscribersEndpoint = require("./list-subscribers/endpoint");
const CampaignRepository = require("./repository");

module.exports = (campaignRepository, authenticate, mailer, hypeConfig) => {
    let app = express();

    //Setup endpoints
    app.post("/", authenticate, createEndpoint(campaignRepository));
    app.post("/:id/subscriber", subscribeEndpoint(campaignRepository, mailer, hypeConfig));
    app.put("/:id/subscriber/:subscriberId", updateSubscriptionEndpoint(campaignRepository));

    app.get("/", authenticate, listCampaignsEndpoint(campaignRepository));
    app.get("/:id/subscriber", authenticate, listSubscribersEndpoint(campaignRepository));

    return app;
};
