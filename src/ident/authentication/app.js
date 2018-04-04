const express = require("express");

module.exports = (authRepository, userRepository) => {
    let app = express();

    app.post("/", (req, res) => {
        let { username, password } = req.body;

        if(!username) {
            return res.status(400).send({ error: "Missing username to authenticate for." });
        }
        if(!password) {
            return res.status(400).send({ error: "Missing password to authenticate for." });
        }

        userRepository.get(username, (error, user) => {
            if(error && error.type == "NotFound") {
                //no such user, but we don't want to leak that. So we just fail.
                //TODO: run pbkdf anyway to shield against timing attacks discovering usernames
                return res.status(400).send({ error: "Invalid username/password combination" });
            }
            if(error) {
                console.error("Failed to get user", error);
                return res.status(500).send({ error: "Failed to authenticate" });
            }

            authRepository.authenticate(user, password, (error, authentication) => {
                if(error && error.type == "PasswordInvalid") {
                    return res.status(400).send({ error: "Invalid username/password combination" });
                }
                if(error) {
                    console.error("Failed to authenticate", error);
                    return res.status(500).send({ error: "Failed to authenticate" });
                }
                res.send({ username, authentication });
            });
        });
    });

    return app;
};
