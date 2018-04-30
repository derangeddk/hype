const express = require("express");
const path = require("path");
const errorPage = require("./errorPage");
const webpack = require("webpack");
const buildPath = path.join(__dirname, "_build");
const page = require("./page")(__dirname);
const campaignView = require("./campaigns/view");
const composeView = require("./campaigns/compose");
const CampaignRepository = require("../api/campaign/repository");
const confirmEndpoint = require("./subscriberActions/confirmEndpoint");

module.exports = (campaignRepository, hypeConfig) => {
    let app = express();

    app.use((req, res, next) => {
        res.errorPage = (code, message) => res.status(code).send(errorPage(code, message));
        next();
    });

    app.get("/", page("dashboard/view.html"));
    app.get("/confirm", confirmEndpoint(campaignRepository));
    app.get("/unsubscribe", page("subscriberActions/unsubscribeView.html"));
    app.get("/campaigns", page("campaigns/list.html"));
    app.get("/campaigns/:id", campaignView());
    app.get("/campaigns/:id/compose", composeView(campaignRepository, hypeConfig));
    app.get("/login", page("login/view.html"));
    app.get("/users", page("users/view.html"));

    // build assets into statically hosted dir
    app.use("/assets", express.static(buildPath));

    buildJs(path.join(__dirname, "client", "browser.js"), "hype");
    buildJs(path.join(__dirname, "campaigns", "emailComposer.js"), "emailComposer");

    app.use((req, res) => res.send(errorPage(404)));

    return app;
};

function buildJs(entryPoint, name) {
    webpack({
        entry: entryPoint,
        output: {
            filename: name + ".js",
            path: buildPath,
            libraryTarget: "var",
            library: name
        }
    }, (error) => {
        if(error) {
            return console.error("Failed to build " + name + " for frontend. Strange behaviour may ensue.");
        }
        console.log("Built " + name + " script to assets");
    });
}
