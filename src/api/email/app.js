const express = require("express");
const htmlToText = require("html-to-text");

module.exports = (campaignRepository, mailer, hypeConfig) => {
    let app = express();

    app.post("/send", (req, res) => {
        let { campaignId, emailContent, subject } = req.body;

        if(!campaignId) {
            return res.status(400).send({ error: "Missing campaign id to send to" });
        }
        if(!emailContent) {
            return res.status(400).send({ error: "Missing email content to send" });
        }
        if(!subject) {
            return res.status(400).send({ error: "Missing subject line of email to send" });
        }

        campaignRepository.get(campaignId, (error, campaign) => {
            if(error && error.type == "NotFound") {
                return res.status(404).send({ error: "No such campaign" });
            }
            if(error) {
                console.error("Failed to get campaign to send email to", campaignId, error);
                return res.status(500).send({ error: "Failed to send email" });
            }

            // Generate additional field
            let subscribers = campaign.subscribers
                                .filter((subscriber) => subscriber.status == "confirmed")
                                .map((subscriber) => {
                                    subscriber.unsubscribeLink = `${hypeConfig.baseUrl}/unsubscribe?campaign=${campaign.id}&subscriber=${subscriber.id}`;
                                    return subscriber;
                                });

            // Get recipients by campaign
            mailer.sendBatch({
                subject,
                text: htmlToText.fromString(emailContent, { wordwrap: 120 }),
                html: emailContent
            }, subscribers, (error) => {
                if(error) {
                    console.error("Failed to send emails with mailer", error);
                    return res.status(500).send({ error: "Failed to send email" });
                }
                return res.send({});
            });
        });
    });

    return app;
};
