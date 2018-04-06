module.exports = (campaignRepository) => (req, res) => {
    let { name } = req.body;
    if(!name) {
        return res.status(400).send({ error: "No `name` provided for new campaign." });
    }

    campaignRepository.create(name, (error, campaign) => {
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
