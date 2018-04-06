const pickKeys = require("../../../utils/pickKeys");

module.exports = (campaignRepository) => (req, res) => {
    let { id } = req.params;
    let { status } = req.query;
    
    campaignRepository.get(id, (error, campaign) => {
        if(error && error.type == "NotFound") {
            return res.status(404).send({ error: "No campaign with that id" });
        }
        if(error) {
            console.error("Failed to get campaign", error, id);
            return res.status(500).send({ error: "Failed to list subscribers" });
        }
        
        let subscribers = cleanSubscribersForPublicView(campaign.subscribers);

        //filter if given a status-filter
        if(status && [ "pending", "confirmed", "unsubscribed" ].includes(status)) {
            subscribers = subscribers.filter((subscriber) => subscriber.status == status);
        }

        res.send({ subscribers });
    });
};

function cleanSubscribersForPublicView(subscribers) {
    return subscribers.map((subscriber) => pickKeys(subscriber, [ "id", "name", "email", "status" ]));
}
