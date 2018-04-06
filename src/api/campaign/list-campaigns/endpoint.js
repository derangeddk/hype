module.exports = (campaignRepository) => (req, res) => {
    campaignRepository.list((error, campaigns) => {
        if(error) {
            console.error("Failed to list campaigns", error);
            return res.status(500).send({ error: "Failed to list campaigns." });
        }
        campaigns = campaigns.map((campaign) => {
                                    campaign.subscribers = campaign.subscribers.filter((subscriber) => subscriber.status == "confirmed").length;
                                    return campaign;
                                });
        res.send({ campaigns });
    });
};
