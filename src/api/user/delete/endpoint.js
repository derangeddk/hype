module.exports = (db) => (req, res) => {
    let { username } = req.params;

    db.query("DELETE FROM users WHERE username=$1::text", [ username ], (error) => {
        if(error) {
            console.error("Failed to delete user", username, error);
            return res.status(500).send({ error: "Failed to delete user" });
        }
        res.send({});
    });
};
