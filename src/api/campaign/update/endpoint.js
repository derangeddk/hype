module.exports = (repository) => (req, res) => {
    let { id } = req.params;
    let { confirmationUrl } = req.body;

    if(!confirmationUrl) {
        return res.status(400).send({ error: "Nothing to update." });
    }
    if(!confirmationUrl.match(/^https?:\/\/.+$/)) {
        return res.status(400).send({ error: "Invalid `confirmationUrl` provided. Must be an URL." });
    }

    repository.get(id, (error, campaign) => {
        if(error && error.type == "NotFound") {
            return res.status(404).send({ error: "No such campaign" });
        }
        if(error) {
            console.error("Failed to get campaign data", error);
            return res.status(500).send({ error: "Failed to update campaign" });
        }
        campaign.confirmationUrl = confirmationUrl;

        repository.update(id, campaign, (error) => {
            if(error && error.type == "NotFound") {
                return res.status(404).send({ error: "No such campaign" });
            }
            if(error) {
                console.error("Failed to update campaign data", error);
                return res.status(500).send({ error: "Failed to update campaign" });
            }
            res.send({ campaign });
        });
    });
};
