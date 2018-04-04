const express = require("express");
const frontend = require("./frontend/app");
const api = require("./api/app");

module.exports = (db, mailer, hypeConfig) => {
    let app = express();
    app.use("/api", api(db, mailer, hypeConfig));
    app.use(frontend(db));
    return app;
};
