module.exports = (repository) => (req, res) => {
    let { username } = req.params;

    repository.update(username, req.body, (error, user) => {
        if(error && error.type == "NotFound") {
            return res.status(404).send({ error: "No such user" });
        }
        if(error) {
            console.error("Failed to update user data", error);
            return res.status(500).send({ error: "Failed to update user" });
        }
        res.send({ user });
    });
};
