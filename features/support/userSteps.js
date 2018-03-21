const { Given, When, Then } = require("cucumber");
const async = require("async");

Given(/^I authenticate as the user "([a-zA-Z0-9]+)" with password "([^"]*)"$/, function(username, password, callback) {
    this.client.auth(username, password, callback);
});

When(/^I create a user with the following information:$/, function(table, callback) {
    let { username, name, email, password } = table.hashes()[0];
    this.client.users.create(username, name, email, password, callback);
});

Then(/^the following users? exists?:$/, function(table, callback) {
    let expectedUsers = table.hashes();

    this.adminClient.users.list((error, data) => {
        if(error) {
            return callback(error);
        }
        checkListForExpectedElements(table.hashes(), data.users, "users", callback);
    });
});

//TODO: Could be used in campaignSteps. Extract.
function checkListForExpectedElements(expecteds, actuals, thingType, callback) {
    let notFound = findElementsNotFound(expecteds, actuals);

    if(notFound.length) {
        return callback({
            trace: new Error(`Some expected ${thingType} not found`),
            notFound,
            expecteds,
            actuals
        });
    }

    callback();
}

//TODO: Duplicate from campaignSteps. Extract.
function findElementsNotFound(expecteds, actuals) {
    return expecteds.filter((expected) => {
        return !actuals.some((actual) => {
            return Object.keys(expected).every((key) => {
                return expected[key] == actual[key];
            });
        });
    });
}

Then(/^I should be able to authenticate as user "([^"]+)" with password "([^"]+)"$/, function(username, password, callback) {
    this.client.auth(username, password, callback);
});

Given(/^the following users have been created:$/, function(table, callback) {
    let usersToCreate = table.hashes();

    async.eachSeries(usersToCreate, ({ username, name, email, password }, callback) => {
        this.adminClient.users.create(username, name, email, password, callback);
    }, callback);
});

When(/^I change the following information for the user "([^"]+)":$/, function(username, table, callback) {
    let dataToChange = table.hashes()[0];
    this.client.users.update(username, dataToChange, callback);
});

When(/^I delete the user "([^"]+)"$/, function(username, callback) {
    this.client.users.delete(username, callback);
});

When(/^I attempt to create a user with the following information:$/, function(table, callback) {
    let { username, name, email, password } = table.hashes()[0];
    this.client.users.create(username, name, email, password, (error, data) => {
        this.attemptResult = { error, data };
        callback();
    });
});

When(/^I attempt to delete the user "([^"]+)"$/, function(username, callback) {
    this.client.users.delete(username, (error, data) => {
        this.attemptResult = { error, data };
        callback();
    });
});

When(/^I attempt to change the following information for the user "([^"]+)":$/, function(username, table, callback) {
    let dataToChange = table.hashes()[0];
    this.client.users.update(username, dataToChange, (error, data) => {
        this.attemptResult = { error, data };
        callback();
    });
});
