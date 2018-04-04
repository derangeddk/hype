module.exports = (repository) => (req, res) => {
    let { username, name, email, password } = req.body;

    if(!username) {
        return res.status(400).send({ error: "Missing username for new user." });
    }
    if(!name) {
        return res.status(400).send({ error: "Missing name for new user." });
    }
    if(!email || !email.match(/^.+@.+$/)) {
        return res.status(400).send({ error: "Missing valid email for new user." });
    }
    if(!password) {
        return res.status(400).send({ error: "Missing password for new user." });
    }

    repository.create(username, password, name, email, (error, user) => {
        if(error) {
            console.error("Failed to create new user", username, name, email, error);
            return res.status(500).send({ error: "Failed to create new user" });
        }
        res.send({ user });
    });
};
