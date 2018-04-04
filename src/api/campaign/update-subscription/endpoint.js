const getCampaign = require("../getCampaign");
const updateCampaignData = require("../updateCampaignData");
const timestamp = require("../../../utils/timestamp");

module.exports = (db) => (req, res) => {
    let { id, subscriberId } = req.params;
    let { status } = req.body;

    getCampaign(db, id, (error, campaign) => {
        if(error && error.type == "NotFound") {
            return res.status(404).send({ error: "No such campaign" });
        }
        if(error) {
            console.error("Failed to get campaign", error, id);
            return res.status(500).send({ error: "Failed to update subscription" });
        }

        let subscriber = campaign.subscribers.find((subscriber) => subscriber.id == subscriberId);
        
        if(!validStateTransition(subscriber.status, status)) {
            return res.status(400).send({ error: `Invalid state transition ${subscriber.status}-->${status} for subscriber`});
        }
        subscriber.status = status;
        subscriber[`${status}At`] = timestamp();

        updateCampaignData(db, id, campaign, (error) => {
            if(error) {
                console.error("Failed to update campaign", error, id, data);
                return res.status(500).send({ error: "Failed to update subscription" });
            }

            res.send({ subscriber });
        });
    });
};

function validStateTransition(from, to) {
    return (from == "pending" && to == "confirmed") || (from != "unsubscribed" && to == "unsubscribed");
}
