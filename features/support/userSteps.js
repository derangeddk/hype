const { Given, When, Then } = require("cucumber");

Given(/^I authenticate as the user "([a-zA-Z0-9]+)" with password "([^"]*)"$/, function(username, password, callback) {
    this.client.auth(username, password, callback);
});
