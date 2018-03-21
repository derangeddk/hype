const uuid = require("uuid");
const getCampaign = require("../getCampaign");
const updateCampaignData = require("../updateCampaignData");
const timestamp = require("../../timestamp");

module.exports = (db) => (req, res) => {
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

            res.send({ subscriber });
        });
    });
};
