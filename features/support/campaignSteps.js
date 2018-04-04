const { Given, When, Then } = require("cucumber");
const async = require("async");

When(/^I create a campaign "([^"]+)"$/, function(campaignName, callback) {
    this.client.campaign.create(campaignName, callback);
});

Then(/^I have ([1-9][0-9]*) campaigns?, including the following:$/, function(numCampaigns, table, callback) {
    this.client.campaign.list((error, data) => {
        if(error) {
            return callback(error);
        }
        
        if(data.campaigns.length !== parseInt(numCampaigns)) {
            return callback({
                error: new Error(`Expected ${numCampaigns} campaigns, but found ${data.campaigns.length}.`),
                data
            });
        }

        let expectedCampaigns = table.hashes();
        let actualCampaigns = data.campaigns;
        let campaignsNotFound = findElementsNotFound(expectedCampaigns, actualCampaigns);

        if(campaignsNotFound.length) {
            return callback({
                trace: new Error("Some campaigns not found in list"),
                campaignsNotFound,
                expectedCampaigns,
                actualCampaigns
            });
        }
        callback();
    });
});

function findElementsNotFound(expecteds, actuals) {
    return expecteds.filter((expected) => {
        return !actuals.some((actual) => {
            return Object.keys(expected).every((key) => {
                return expected[key] == actual[key];
            });
        });
    });
}

Given(/^a campaign "([^"]+)" exists$/, function(campaignName, callback) {
    this.adminClient.campaign.create(campaignName, callback);
});

When(/^I list all campaigns$/, function(callback) {
    this.client.campaign.list((error, data) => {
        if(error) {
            return callback(error);
        }
        this.receivedList = data.campaigns;
        callback();
    });
});

When(/^I sign up for the "([^"]+)" campaign with the following information:$/, function(campaignName, table, callback) {
    //Find campaign id
    this.findCampaignByName(campaignName, (error, campaign) => {
        if(error) {
            return callback(error);
        }

        let { name, email } = table.hashes()[0];
        
        //Sign up for campaign
        this.client.campaign.subscribe(campaign.id, name, email, callback);
    });
});

Then(/^the following campaigns? exists?:$/, function(table, callback) {
    this.adminClient.campaign.list((error, data) => {
        if(error) {
            return callback(error);
        }

        let expectedCampaigns = table.hashes();
        let actualCampaigns = data.campaigns;
        let campaignsNotFound = findElementsNotFound(expectedCampaigns, actualCampaigns);

        if(campaignsNotFound.length) {
            return callback({
                trace: new Error("Some campaigns not found in list"),
                campaignsNotFound,
                expectedCampaigns,
                actualCampaigns
            });
        }
        callback();
    });
});

Then(/^the subscribers to the "([^"]+)" campaign are:$/, function(campaignName, table, callback) {
    this.findCampaignByName(campaignName, (error, campaign) => {
        if(error) {
            return callback(error);
        }
        this.adminClient.campaign.listSubscribers(campaign.id, (error, data) => {
            if(error) {
                return callback(error);
            }

            let expectedSubscribers = table.hashes();
            let actualSubscribers = data.subscribers;
            let subscribersNotFound = findElementsNotFound(expectedSubscribers, actualSubscribers);
            
            if(subscribersNotFound.length) {
                return callback({
                    trace: new Error("Some subscribers not found in list"),
                    subscribersNotFound,
                    expectedSubscribers,
                    actualSubscribers
                });
            }

            callback();
        });
    })
});

Given(/^the following users have signed up for the "([^"]+)" campaign:$/, function(campaignName, table, callback) {
    this.findCampaignByName(campaignName, (error, campaign) => {
        if(error) {
            return callback(error);
        }

        let usersToSignUp = table.hashes();
        async.eachSeries(usersToSignUp, (user, callback) => {
            this.adminClient.campaign.subscribe(campaign.id, user.name, user.email, callback);
        }, callback);
    });
});

When(/^I confirm the subscription for (.+) to the "([^"]+)" campaign$/, function(emailToConfirm, campaignName, callback) {
    confirmEmailInCampaign.call(this, this.client, emailToConfirm, campaignName, callback);
});

function confirmEmailInCampaign(client, emailToConfirm, campaignName, callback) {
    this.findCampaignAndSubscriber(campaignName, emailToConfirm, (error, campaign, subscriber) => {
        if(error) {
            return callback(error);
        }
        client.campaign.confirmSubscription(campaign.id, subscriber.id, callback);
    });
}

Given(/^the subscription for (.+) to the "([^"]+)" campaign is confirmed$/, function(emailToConfirm, campaignName, callback) {
    confirmEmailInCampaign.call(this, this.adminClient, emailToConfirm, campaignName, callback);
});

When(/^I list the confirmed subscribers to the "([^"]+)" campaign$/, function(campaignName, callback) {
    this.findCampaignByName(campaignName, (error, campaign) => {
        if(error) {
            return callback(error);
        }
        this.client.campaign.listConfirmedSubscribers(campaign.id, (error, data) => {
            if(error) {
                return callback(error);
            }
            this.receivedList = data.subscribers;
            callback();
        });
    });
});

Then(/^I receive the following list:$/, function(table, callback) {
    let expectedList = table.hashes();
    let { receivedList } = this;

    // Ensure that we only check expected fields when reversing the check (elementsNotExpected below)
    receivedList = receivedList.map((receivedRow) => {
        let newRow = {};
        let expectedHeaders = table.raw()[0];
        expectedHeaders.forEach((expectedHeader) => newRow[expectedHeader] = receivedRow[expectedHeader]);
        return newRow;
    });

    let elementsNotFound = findElementsNotFound(expectedList, receivedList);

    if(elementsNotFound.length) {
        return callback({
            trace: new Error("Some expected elements were not found in list"),
            elementsNotFound,
            expectedList,
            receivedList
        });
    }

    let elementsNotExpected = findElementsNotFound(receivedList, expectedList);

    if(elementsNotExpected.length) {
        return callback({
            trace: new Error("Some unexpected elements were found in list"),
            elementsNotExpected,
            expectedList,
            receivedList
        });
    }

    callback();
});

When(/^I list the subscribers to the "([^"]+)" campaign$/, function(campaignName, callback) {
    this.findCampaignByName(campaignName, (error, campaign) => {
        if(error) {
            return callback(error);
        }
        this.client.campaign.listSubscribers(campaign.id, (error, data) => {
            if(error) {
                return callback(error);
            }
            this.receivedList = data.subscribers;
            callback();
        });
    });
});

When(/^I unsubscribe (.+) from the "([^"]+)" campaign$/, function(emailToUnsubscribe, campaignName, callback) {
    this.findCampaignAndSubscriber(campaignName, emailToUnsubscribe, (error, campaign, subscriber) => {
        if(error) {
            return callback(error);
        }
        this.client.campaign.unsubscribe(campaign.id, subscriber.id, callback);
    });
});

When(/^I attempt to create a campaign "([^"]+)"$/, function(campaignName, callback) {
    this.client.campaign.create(campaignName, (error, data) => {
        this.attemptResult = { error, data };
        callback();
    });
});

Then(/^I am told that I must be authenticated to perform that action$/, function(callback) {
    let { error } = this.attemptResult;
    if(!error) {
        return callback(new Error("Attempt succeeded unexpectedly."));
    }
    if(!error.statusCode || error.statusCode != 401) {
        return callback({
            trace: new Error("Attempt failed, but with an unexpected error"),
            result: this.attemptResult
        });
    }
    callback();
});

When(/^I attempt to list all campaigns$/, function(callback) {
    this.client.campaign.list((error, data) => {
        this.attemptResult = { error, data };
        callback();
    });
});

When(/^I attempt to list the subscribers to the "([^"]+)" campaign$/, function(campaignName, callback) {
    this.findCampaignByName(campaignName, (error, campaign) => {
        if(error) {
            return callback(error);
        }
        this.client.campaign.listSubscribers(campaign.id, (error, data) => {
            this.attemptResult = { error, data };
            callback();
        });
    });
});

Then(/^an email has been sent to (.+)$/, function(email, callback) {
    let emailSent = this.mailerStub.emailsSent.some((sentEmail) => sentEmail.recipient.email == email);
    if(!emailSent) {
        return callback({
            trace: new Error("No email found sent to " + email),
            sentEmails: this.mailerStub.emailsSent
        });
    }
    callback();
});
