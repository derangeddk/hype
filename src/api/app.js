const express = require("express");
const bodyParser = require("body-parser");
const campaignApp = require("./campaign/app");

module.exports = (db) => {
    let app = express();

    app.use(bodyParser.json());
    
    app.use("/campaign", campaignApp(db));

    app.use(function notFound(req, res) {
        res.status(404).send({ error: `Endpoint ${req.originalUrl} not found` });
    });

    return app;
};
