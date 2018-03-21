const rowToCampaign = require("../rowToCampaign");

module.exports = (db) => (req, res) => {
    db.query("SELECT * FROM campaigns", (error, data) => {
        if(error) {
            console.error("Failed to list campaigns", error);
            return res.status(500).send({ error: "Failed to list campaigns." });
        }

        let campaigns = data.rows
                            .map(rowToCampaign)
                            .map((campaign) => {
                                    campaign.subscribers = campaign.subscribers.filter((subscriber) => subscriber.status == "confirmed").length;
                                    return campaign;
                            });

        res.send({ campaigns });
    })
};
