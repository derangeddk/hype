const express = require("express");
const ensureDb = require("../ensureDb");
const timestamp = require("../timestamp");
const crypto = require("crypto");
const hashPassword = require("./hashPassword");

module.exports = (db) => {
    let app = express();

    //ensure auth db
    ensureDb(db, "authentication (id text NOT NULL, data json NOT NULL)", (error) => {
        if(error) {
            console.error("Failed to ensure authentication db", error);
            process.exit(1);
        }
    });

    app.post("/", (req, res) => {
        let { username, password } = req.body;

        if(!username) {
            return res.status(400).send({ error: "Missing username to authenticate for." });
        }
        if(!password) {
            return res.status(400).send({ error: "Missing password to authenticate for." });
        }

        // if username + password exists, generate authentication token
        db.query("SELECT * FROM users WHERE username=$1::text", [ username ], (error, data) => {
            if(error) {
                console.error("Failed to get user", error);
                return res.status(500).send({ error: "Failed to authenticate" });
            }
            if(!data.rows.length) {
                //no such user, but we don't want to leak that. So we just fail.
                //TODO: run pbkdf anyway to shield against timing attacks discovering usernames
                return res.status(400).send({ error: "Invalid username/password combination" });
            }
            let { passwordHash, salt } = data.rows[0].data;
            hashPassword(password, salt, (error, newHash) => {
                if(error) {
                    console.error("Failed to hash password", error);
                    return res.status(500).send({ error: "Failed to authenticate" });
                }
                if(passwordHash !== newHash.toString("hex")) {
                    return res.status(400).send({ error: "Invalid username/password combination" });
                }
                crypto.randomBytes(32, (error, authentication) => {
                    if(error) {
                        console.error("Failed to randomly generate auhtentication", error);
                        return res.status(500).send({ error: "Failed to authenticate" });
                    }
                    authentication = authentication.toString("hex");
                    let authenticationData = {
                        username,
                        authenticatedAt: timestamp(),
                        expiresAt: timestamp({ future: 3 * 24 * 60 * 60 * 1000 })
                    }
                    db.query("INSERT INTO authentication (id, data) VALUES ($1::text, $2::json)", [ authentication, authenticationData ], (error) => {
                        if(error) {
                            console.error("Failed to save auhtentication", error);
                            return res.status(500).send({ error: "Failed to authenticate" });
                        }
                        res.send({ username, authentication });
                    });
                });
            });
        });
    });

    return app;
};
