const { setWorldConstructor, Before, After } = require("cucumber");
const client = require("../../src/frontend/client/index");
const request = require("request");
const hype = require("../../src/app");
const PostgresPool = require("pg-pool");
const config = require("config");

const port = 4000;

setWorldConstructor(function() {
    let serverUri = `http://localhost:${port}`;

    this.client = client((method, endpoint, data, auth, callback) => {
        //TODO: auth
        let requestOpts = {
            method,
            url: `${serverUri}/api${endpoint}`,
            json: true
        };

        if(data) {
            requestOpts.json = data;
        }

        request(requestOpts, (error, httpResponse, body) => {
            if(error) {
                return callback({
                    trace: error,
                    message: "Error in request",
                    body
                });
            }
            if(httpResponse.statusCode >= 400) {
                return callback({
                    trace: new Error("Status code invalid"),
                    message: `Status code ${httpResponse.statusCode}`,
                    body
                });
            }
            callback(null, body);
        });
    });

    this.findCampaignByName = (campaignName, callback) => this.client.campaign.list((error, data) => {
        if(error) {
            return callback(error);
        }
        let campaign = data.campaigns.find((campaign) => campaign.name == campaignName);
        if(!campaign) {
            return callback({
                trace: new Error("No such campaign"),
                campaignName
            });
        }
        callback(null, campaign);
    });

    this.findCampaignAndSubscriber = (campaignName, email, callback) => {
        this.findCampaignByName(campaignName, (error, campaign) => {
            if(error) {
                return callback(error);
            }
            this.client.campaign.listSubscribers(campaign.id, (error, result) => {
                if(error) {
                    return callback(error);
                }
                let subscriber = result.subscribers.find((subscriber) => subscriber.email == email);

                callback(null, campaign, subscriber);
            });
        });
    };
});

Before(function(testCase, callback) {
    //set up db
    let db = new PostgresPool(config.postgres);

    //clear db
    db.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;", (error) => {
        if(error) {
            return callback(error);
        }

        //start server
        let app = hype(db);
        this.server = app.listen(port);

        callback();
    });
});

After(function(testCase, callback) {
    this.server.close(callback);
});
