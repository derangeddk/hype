const crypto = require("crypto");
const ensureDb = require("../../utils/ensureDb");
const timestamp = require("../../utils/timestamp");
const hashPassword = require("./hashPassword");

module.exports = (db) => {
    //ensure auth db
    ensureDb(db, "authentication (id text NOT NULL, data json NOT NULL)", (error) => {
        if(error) {
            console.error("Failed to ensure authentication db", error);
            process.exit(1);
        }
    });

    return {
        authenticate: (user, password, callback) => {
            validatePassword(user, password, (error) => {
                if(error) {
                    return callback(error);
                }
                createAuthToken(db, user.username, (error, authentication) => {
                    if(error) {
                        return callback(error);
                    }
                    callback(null, authentication);
                });
            });
        },
        validateAuthentication: (authentication, callback) => {
            db.query("SELECT * FROM authentication WHERE id=$1::text", [ authentication ], (error, data) => {
                if(error) {
                    return callback(error);
                }
                if(!data.rows.length) {
                    return callback({
                        type: "NotFound",
                        trace: new Error("No authentication found")
                    });
                }
                let { username, expiresAt } = data.rows[0].data;
                if(expiresAt <= timestamp()) {
                    return callback({
                        type: "Expired",
                        trace: new Error("Authentication is expired")
                    });
                }
                callback(null, username);
            });
        }
    };
};

function validatePassword(user, password, callback) {
    let { passwordHash, salt } = user;
    hashPassword(password, salt, (error, newHash) => {
        if(error) {
            return callback(error);
        }
        if(passwordHash !== newHash.toString("hex")) {
            return callback({
                trace: new Error("Invalid password"),
                type: "PasswordInvalid"
            });
        }
        callback();
    });
}

function createAuthToken(db, username, callback) {
    crypto.randomBytes(32, (error, authentication) => {
        if(error) {
            return callback({
                trace: new Error("Failed to randomly generate authentication"),
                previousError: error
            });
        }
        authentication = authentication.toString("hex");
        let authenticationData = {
            username,
            authenticatedAt: timestamp(),
            expiresAt: timestamp({ future: 3 * 24 * 60 * 60 * 1000 })
        };
        db.query("INSERT INTO authentication (id, data) VALUES ($1::text, $2::json)", [ authentication, authenticationData ], (error) => {
            if(error) {
                return callback({
                    trace: new Error("Failed to save authentication"),
                    previousError: error
                });
            }
            callback(null, authentication);
        });
    });
}
