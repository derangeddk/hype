const uuid = require("uuid");
const getCampaign = require("../getCampaign");
const updateCampaignData = require("../updateCampaignData");
const timestamp = require("../../../utils/timestamp");

module.exports = (db, mailer, hypeConfig) => (req, res) => {
    let { id } = req.params;
    let { name, email } = req.body;

    if(!name) {
        return res.status(400).send({ error: "Missing `name` for subscriber" });
    }
    if(!email || !email.match(/^.+@.+$/)) {
        return res.status(400).send({ error: "Missing or invalid `email` for subscriber" });
    }

    getCampaign(db, id, (error, campaign) => {
        if(error && error.type == "NotFound") {
            return res.status(404).send({ error: "No such campaign" });
        }
        if(error) {
            console.error("Failed to get campaign", error);
        }

        let subscriber = { id: uuid.v4(), name, email, status: "pending", subscribedAt: timestamp() };
        campaign.subscribers.push(subscriber);

        updateCampaignData(db, id, campaign, (error) => {
            if(error) {
                console.error("Failed to update campaign", error, id, data);
                return res.status(500).send({ error: "Failed to subscribe" });
            }

            sendSignedUpMail(mailer, hypeConfig, subscriber, { id, ...campaign }, (error) => {
                if(error) {
                    console.error("Failed to send signup confirmation email", error, { subscriber, campaign });
                    return res.status(500).send({ error: "Failed to subscribe" });
                }
                res.send({ subscriber });
            });
        });
    });
};

function sendSignedUpMail(mailer, hypeConfig, subscriber, campaign, callback) {
    let hypeUrl = hypeConfig.baseUrl;
    let makeLink = (endpoint) => `${hypeUrl}${endpoint}?campaign=${campaign.id}&subscriber=${subscriber.id}`
    let confirmSubscriptionLink = makeLink("/confirm");
    let unsubscribeLink = makeLink("/unsubscribe");

    let recipient = { ...subscriber, confirmSubscriptionLink, unsubscribeLink };

    let template = {
        subject: "Hi {{ name }}, thanks for signing up to the " + campaign.name + " newsletter",
        html: `
            <p>Hi {{ name }},</p>
            <p>
                Your email, {{ email }}, was just used to sign up for the ${campaign.name} newsletter.
            </p>
            <p>
                To start receiving newsletters, you have to <a href="{{ confirmSubscriptionLink }}">confirm your subscription</a>.
            </p>
            <p>
                If you did not sign up, you can <a href="{{ unsubscribeLink }}">remove yourself from our records right now</a>.
            </p>
            <p>
                If you take no action we will not send you any more emails.
            </p>
            <p>
                Best,<br>
                ${campaign.name} team
            </p>
        `,
        text: `
            Hi {{ name }},

            Your email, {{ email }}, was just used to sign up for the ${campaign.name} newsletter.

            To confirm your subscription (letting us send you emails), follow this link: {{ confirmSubscriptionLink }}

            If you did not sign up, you can remove yourself from our records by using this link: {{ unsubscribeLink }}

            If you take no action we will not send you any more emails.

            Best,
            ${campaign.name} team
        `
    };
    mailer.send(template, recipient, callback);
}
