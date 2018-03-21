const express = require("express");
const createEndpoint = require("./create/endpoint");
const subscribeEndpoint = require("./subscribe/endpoint");
const updateSubscriptionEndpoint = require("./update-subscription/endpoint");
const listCampaignsEndpoint = require("./list-campaigns/endpoint");
const listSubscribersEndpoint = require("./list-subscribers/endpoint");

module.exports = (db) => {
    let app = express();

    //Ensure campaign db
    db.query("CREATE TABLE IF NOT EXISTS campaigns (id uuid NOT NULL, data json NOT NULL)", (error) => {
        if(error) {
            console.error("Failed to create campaigns table.");
            process.exit(1);
        }
    });

    //Setup endpoints
    app.post("/", createEndpoint(db));
    app.post("/:id/subscriber", subscribeEndpoint(db));
    app.put("/:id/subscriber/:subscriberId", updateSubscriptionEndpoint(db));

    app.get("/", listCampaignsEndpoint(db));
    app.get("/:id/subscriber", listSubscribersEndpoint(db));

    return app;
};
