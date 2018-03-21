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
    this.client.auth("admin", "admin", (error) => {
        if(error) {
            return callback(error);
        }
        this.client.campaign.create(campaignName, callback);
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
    this.client.campaign.list((error, data) => {
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
        this.client.campaign.listSubscribers(campaign.id, (error, data) => {
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
        async.each(usersToSignUp, (user, callback) => {
            this.client.campaign.subscribe(campaign.id, user.name, user.email, callback);
        }, callback);
    });
});

When(/^I confirm the subscription for (.+) to the "([^"]+)" campaign$/, confirmEmailInCampaign);

function confirmEmailInCampaign(emailToConfirm, campaignName, callback) {
    this.findCampaignAndSubscriber(campaignName, emailToConfirm, (error, campaign, subscriber) => {
        if(error) {
            return callback(error);
        }
        this.client.campaign.confirmSubscription(campaign.id, subscriber.id, callback);
    });
}

Given(/^the subscription for (.+) to the "([^"]+)" campaign is confirmed$/, confirmEmailInCampaign);

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
