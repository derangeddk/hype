module.exports = (campaignRepository) => (req, res) => {
    let { name, confirmationUrl } = req.body;
    if(!name) {
        return res.status(400).send({ error: "No `name` provided for new campaign." });
    }

    if(!confirmationUrl) {
        confirmationUrl = null;
    }
    else if(!confirmationUrl.match(/^https?:\/\/.+$/)) {
        return res.status(400).send({ error: "Invalid `confirmationUrl` provided. Must be an URL." });
    }

    campaignRepository.create(name, confirmationUrl, (error, campaign) => {
        if(error) {
            console.error({
                trace: new Error("Failed to insert new campaign"),
                id, name
            });
            return res.status(500).send({ error: "Failed to create campaign." });
        }
        res.send({ campaign });
    });
};
