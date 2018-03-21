const express = require("express");
const dashboardPage = require("./dashboard/page");
const campaignsList = require("./campaigns/list");
const campaignView = require("./campaigns/view");
const loginPage = require("./login/page");
const usersPage = require("./users/page");
const path = require("path");
const errorPage = require("./errorPage");
const webpack = require("webpack");
const buildPath = path.join(__dirname, "_build");

module.exports = (db) => {
    let app = express();

    app.get("/", dashboardPage());
    app.get("/campaigns", campaignsList());
    app.get("/campaigns/:id", campaignView());
    app.get("/login", loginPage());
    app.get("/users", usersPage());

    // build assets into statically hosted dir
    app.use("/assets", express.static(buildPath));

    webpack({
        entry: path.join(__dirname, "client", "browser.js"),
        output: {
            filename: "hype.js",
            path: buildPath,
            libraryTarget: "var",
            library: "hype"
        }
    }, (error) => {
        if(error) {
            return console.error("Failed to build assets for frontend. Strange behaviour may ensue.");
        }
        console.log("Built all scripts to assets");
    });

    app.use((req, res) => res.send(errorPage(404)));

    return app;
};
