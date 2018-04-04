#!node
const hype = require("./src/app");
const PostgresPool = require("pg-pool");
const MailgunMustacheMailer = require("mailgun-mustache-mailer");
const config = require("config");

const port = 4000;

//set up dependencies
const db = new PostgresPool(config.postgres);
const mailer = new MailgunMustacheMailer(config.mailgun, { info: console.log });

//start server
const app = hype(db, mailer, config.hype);
const server = app.listen(port);
