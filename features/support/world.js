const { setWorldConstructor, Before, After } = require("cucumber");
const client = require("../../src/frontend/client/index");
const request = require("request");
const hype = require("../../src/app");
const PostgresPool = require("pg-pool");
const config = require("config");

const port = 4000;

setWorldConstructor(function() {
    this.findCampaignByName = (campaignName, callback) => this.adminClient.campaign.list((error, data) => {
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
            this.adminClient.campaign.listSubscribers(campaign.id, (error, result) => {
                if(error) {
                    return callback(error);
                }
                let subscriber = result.subscribers.find((subscriber) => subscriber.email == email);
                if(!subscriber) {
                    return callback({
                        trace: new Error("No such subscriber"),
                        email,
                        campaign,
                        subscribers: result.subscribers
                    });
                }

                callback(null, campaign, subscriber);
            });
        });
    };
});

function makeClient(serverUri, name) {
    return client((method, endpoint, data, auth, callback) => {
        let requestOpts = {
            method,
            url: `${serverUri}/api${endpoint}`,
            json: true
        };

        if(auth) {
            requestOpts.headers = { 'X-Auth-Token': auth };
        }

        if(data) {
            requestOpts.json = data;
        }

        //console.log(`[${name}]${auth ? "@" : "x"}:`, endpoint);
        // TODO: turn into debug statement

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
                    statusCode: httpResponse.statusCode,
                    body
                });
            }
            callback(null, body);
        });
    });
}

Before(function(testCase, callback) {
    //set up clients (they need to be set up in Before so their state is cleared each scenario)
    let serverUri = `http://localhost:${port}`;
    //console.log("--client reset--"); //TODO: make debug statement
    this.client = makeClient(serverUri, "client");
    this.adminClient = makeClient(serverUri, "admin");

    //set up dependencies
    let db = new PostgresPool(config.postgres);
    this.mailerStub = makeMailerStub.call(this);

    //clear db
    db.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;", (error) => {
        if(error) {
            return callback(error);
        }

        //start server
        let app = hype(db, this.mailerStub, { baseUrl: "///hype-integration-test///" });
        this.server = app.listen(port);

        //TODO: fix this timeout
        //      it exists to wait for databases to be ensured.
        //      a better model would have a listener on the app for "setup complete" or similar
        setTimeout(() => this.adminClient.auth("admin", "admin", callback), 1000);
    });
});

function makeMailerStub() {
    let emailsSent = [];

    return {
        send: mockSend,
        sendBatch: mockSendBatch,
        emailsSent,
        withConfig: mockWithConfig
    };

    function mockSend(template, recipient, callback) {
        emailsSent.push({ template, recipient, mailgunConfig: this.mailgunConfig });
        callback();
    }

    function mockSendBatch(template, recipients, callback) {
        recipients.forEach((recipient) => emailsSent.push({ template, recipient, mailgunConfig: this.mailgunConfig }));
        callback();
    }

    function mockWithConfig(mailgunConfig) {
        return {
            send: mockSend.bind({ mailgunConfig }),
            sendBatch: mockSendBatch.bind({ mailgunConfig }),
            emailsSent,
            withConfig: mockWithConfig
        }
    }
}

After(function(testCase, callback) {
    this.server.close(callback);
});
