const uuid = require("uuid");
const timestamp = require("../../timestamp");

module.exports = (db) => (req, res) => {
    let { name } = req.body;
    if(!name) {
        return res.status(400).send({ error: "No `name` provided for new campaign." });
    }

    let id = uuid.v4();
    let data = { name, subscribers: [], createdAt: timestamp() };

    db.query("INSERT INTO campaigns (id, data) VALUES ($1::uuid, $2::json)", [ id, data ], (error) => {
        if(error) {
            console.error({
                trace: new Error("Failed to insert new campaign"),
                id, name
            });
            return res.status(500).send({ error: "Failed to create campaign." });
        }
        res.send({ campaign: { id, name, subscribers: 0 } });
    });
};
