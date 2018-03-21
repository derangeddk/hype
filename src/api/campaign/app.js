const express = require("express");
const createEndpoint = require("./create/endpoint");
const subscribeEndpoint = require("./subscribe/endpoint");
const updateSubscriptionEndpoint = require("./update-subscription/endpoint");
const listCampaignsEndpoint = require("./list-campaigns/endpoint");
const listSubscribersEndpoint = require("./list-subscribers/endpoint");
const ensureDb = require("../ensureDb");
const authenticationMiddleware = require("../authentication/middleware");

module.exports = (db) => {
    let app = express();

    //Ensure campaign db
    ensureDb(db, "campaigns (id uuid NOT NULL, data json NOT NULL)", (error) => {
        if(error) {
            console.error("Failed to create campaigns table.", error);
            process.exit(1);
        }
    });

    let authenticate = authenticationMiddleware(db);

    //Setup endpoints
    app.post("/", authenticate, createEndpoint(db));
    app.post("/:id/subscriber", subscribeEndpoint(db));
    app.put("/:id/subscriber/:subscriberId", updateSubscriptionEndpoint(db));

    app.get("/", authenticate, listCampaignsEndpoint(db));
    app.get("/:id/subscriber", authenticate, listSubscribersEndpoint(db));

    return app;
};
