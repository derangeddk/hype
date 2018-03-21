#!node
const hype = require("./src/app");
const PostgresPool = require("pg-pool");
const config = require("config");

const port = 4000;

//set up db
const db = new PostgresPool(config.postgres);

//start server
const app = hype(db);
const server = app.listen(port);
