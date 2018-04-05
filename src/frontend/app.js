const express = require("express");
const subscriberConfirm = require("./subscriberActions/confirmPage");
const subscriberUnsubscribe = require("./subscriberActions/unsubscribePage");
const campaignsList = require("./campaigns/list");
const campaignView = require("./campaigns/view");
const loginPage = require("./login/page");
const usersPage = require("./users/page");
const path = require("path");
const errorPage = require("./errorPage");
const webpack = require("webpack");
const buildPath = path.join(__dirname, "_build");
const page = require("./page")(__dirname);

module.exports = (db) => {
    let app = express();

    app.get("/", page("dashboard/view.html"));
    app.get("/confirm", subscriberConfirm());
    app.get("/unsubscribe", subscriberUnsubscribe());
    app.get("/campaigns", campaignsList());
    app.get("/campaigns/:id", campaignView());
    app.get("/campaigns/:id/compose", page("campaigns/compose.html"));
    app.get("/login", loginPage());
    app.get("/users", usersPage());

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
