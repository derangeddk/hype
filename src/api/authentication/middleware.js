const timestamp = require("../timestamp");

module.exports = (db) => (req, res, next) => {
    let authentication = req.get("X-Auth-Token");
    if(!authentication) {
        return res.status(401).send({ error: "You must authenticate to perform this action." });
    }
    db.query("SELECT * FROM authentication WHERE id=$1::text", [ authentication ], (error, data) => {
        if(error) {
            console.error("Failed to get authentication from db", error);
            return res.status(500).send({ error: "Failed to authenticate" });
        }
        if(!data.rows.length) {
            return res.status(401).send({ error: "You must authenticate to perform this action." });
        }
        let { username, expiresAt } = data.rows[0].data;
        if(expiresAt <= timestamp()) {
            return res.status(401).send({ error: "You must authenticate to perform this action." });
        }
        req.username = username;
        next();
    });
};
