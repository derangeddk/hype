#!node
const hype = require("./src/app");
const PostgresPool = require("pg-pool");
const mailerWrapper = require("./mailerWrapper");
const config = require("config");

process.once("SIGINT", () => process.exit(0));

const port = 4000;

//set up dependencies
const db = new PostgresPool(config.postgres);
const mailer = mailerWrapper(config.mailgun);

//start server
const app = hype(db, mailer, config.hype);
const server = app.listen(port);
