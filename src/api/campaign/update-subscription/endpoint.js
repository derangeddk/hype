const timestamp = require("../../../utils/timestamp");

module.exports = (campaignRepository) => (req, res) => {
    let { id, subscriberId } = req.params;
    let { status } = req.body;

    campaignRepository.changeSubscriptionStatus(id, subscriberId, status, (error, subscriber) => {
        if(error && error.type == "NotFound") {
            return res.status(404).send({ error: "No such subscriber" });
        }
        if(error && error.type == "InvalidTransition") {
            return res.status(400).send({ error: `Invalid state transition -->${status} for subscriber`});
        }
        if(error) {
            console.error("Failed to change subscription status", error, id, subscriberId);
            return res.status(500).send({ error: "Failed to update subscription" });
        }
        res.send({ subscriber });
    });
};
