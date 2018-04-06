const { Given, When, Then } = require("cucumber");

Then(/^an email has been sent to (.+@.+) with the following text content:$/, function(email, table, callback) {
    let content = table.raw()[0][0];

    let emailSent = this.mailerStub.emailsSent.some((sentEmail) => {
        return sentEmail.recipient.email == email && sentEmail.template.text == content;
    });
    if(!emailSent) {
        return callback({
            trace: new Error("No email found sent to " + email + " with content " + content),
            sentEmails: this.mailerStub.emailsSent
        });
    }

    callback();
});

Then(/^an email has been sent to (.+@.*[^:])$/, function(email, callback) {
    let emailSent = this.mailerStub.emailsSent.some((sentEmail) => sentEmail.recipient.email == email);
    if(!emailSent) {
        return callback({
            trace: new Error("No email found sent to " + email),
            sentEmails: this.mailerStub.emailsSent
        });
    }
    callback();
});

When(/^I send an email to the "([^"]+)" campaign with the following content:$/, function(campaignName, table, callback) {
    this.findCampaignByName(campaignName, (error, campaign) => {
        if(error) {
            return callback(error);
        }

        let content = table.hashes()[0];

        this.client.email.send(campaign.id, content.subject, content.html, (error) => {
            if(error) {
                return callback(error);
            }
            callback();
        });
    });
});

When(/^I attempt to send an email to the "([^"]+)" campaign with the following content:$/, function(campaignName, table, callback) {
    this.findCampaignByName(campaignName, (error, campaign) => {
        if(error) {
            return callback(error);
        }

        let content = table.hashes()[0];

        this.client.email.send(campaign.id, content.subject, content.html, (error) => {
            this.attemptResult = { error };
            callback();
        });
    });
});
