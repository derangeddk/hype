module.exports = (repository) => (req, res) => {
    let { username } = req.params;

    repository.delete(username, (error) => {
        if(error) {
            console.error("Failed to delete user", username, error);
            return res.status(500).send({ error: "Failed to delete user" });
        }
        res.send({});
    });
};
