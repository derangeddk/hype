module.exports = (db) => (req, res) => {
    db.query("SELECT * FROM users", (error, data) => {
        if(error) {
            console.error("Failed to get users from db", error);
            return res.status(500).send({ error: "Failed to list users" });
        }
        let users = data.rows.map(({ username, data }) => {
            return { username, name: data.name, email: data.email };
        });
        res.send({ users });
    });
};
