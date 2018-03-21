const express = require("express");
const frontend = require("./frontend/app");
const api = require("./api/app");

module.exports = (db) => {
    let app = express();
    app.use("/api", api(db));
    app.use(frontend(db));
    return app;
};
