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

Then(/^an email has been sent to ([^\s]+) with the following mailgun config:$/, function(email, table, callback) {
    let mailgunConfig = table.hashes()[0];
    let emailSent = this.mailerStub.emailsSent.find((sentEmail) => {
        return sentEmail.recipient.email == email && configsEqual(sentEmail.mailgunConfig, mailgunConfig);
    });

    if(!emailSent) {
        return callback({
            trace: new Error("No email found sent to " + email + " with correct mailgun config"),
            sentEmails: this.mailerStub.emailsSent.map((email) => JSON.stringify(email)),
            mailgunConfig
        });
    }

    callback();
});

function configsEqual(a, b) {
    if(!a || !b) {
        return false;
    }
    return a.from == b.from && a.domain == b.domain && a.apiKey && b.apiKey;
}
