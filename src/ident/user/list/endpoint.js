module.exports = (repository) => (req, res) => {
    repository.list((error, users) => {
        if(error) {
            console.error("Failed to get users from db", error);
            return res.status(500).send({ error: "Failed to list users" });
        }
        res.send({ users });
    });
};
