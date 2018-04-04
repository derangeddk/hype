const hashPassword = require("../authentication/hashPassword");
const generateSalt = require("../authentication/generateSalt");
const timestamp = require("../../utils/timestamp");
const ensureDb = require("../../utils/ensureDb");

module.exports = (db) => {
    //ensure users db
    ensureDb(db, "users (username text NOT NULL, data json NOT NULL)", {
        onCreate: (callback) => createNewUser(db, "admin", "admin", "Admin User", "nil@admin", callback)
    }, (error) => {
        if(error) {
            console.error("Failed to ensure users db", error);
            process.exit(1);
        }
    });

    return {
        create: (username, password, name, email, callback) => createNewUser(db, username, password, name, email, callback),
        get: (username, callback) => {
            db.query("SELECT * FROM users WHERE username=$1::text", [ username ], (error, data) => {
                if(error) {
                    return callback(error);
                }
                if(!data.rows.length) {
                    return callback({
                        type: "NotFound",
                        trace: new Error("No such user " + username)
                    });
                }
                let user = data.rows[0].data;
                user.username = username;
                callback(null, user);
            });
        },
        delete: (username, callback) => db.query("DELETE FROM users WHERE username=$1::text", [ username ], callback),
        list: (callback) => {
            db.query("SELECT * FROM users", (error, data) => {
                if(error) {
                    return callback(error);
                }
                let users = data.rows.map(({ username, data }) => {
                    return { username, name: data.name, email: data.email };
                });
                callback(null, users);
            });
        },
        update: (username, data, callback) => {
            //TODO: support updating username
            let newData = filterKeys(data, [ "name", "email" ]);
            let newPassword = data.password;

            db.query("SELECT * FROM users WHERE username=$1::text", [ username ], (error, data) => {
                if(error) {
                    return callback(error);
                }
                if(!data.rows.length) {
                    return callback({
                        type: "NotFound",
                        trace: new Error("No such user " + username)
                    });
                }

                updateUserData(username, data.rows[0].data, newData, newPassword, (error, user) => {
                    if(error) {
                        return callback(error);
                    }
                    db.query("UPDATE users SET data=$2::json WHERE username=$1::text", [ username, user ], (error) => {
                        if(error) {
                            return callback(error);
                        }
                        callback(null, { username, name: user.name, email: user.email });
                    });
                });
            });
        }
    };
};

function filterKeys(obj, keys) {
    let newObj = {};
    keys.forEach((key) => {
        if(typeof obj[key] !== "undefined") {
            newObj[key] = obj[key];
        }
    });
    return newObj;
}

function updateUserData(username, user, newData, newPassword, callback) {
    Object.keys(newData).forEach((key) => {
        user[key] = newData[key];
    });

    if(!newPassword) {
        return callback(null, user);
    }
    generateSalt((error, salt) => {
        if(error) {
            return callback(error);
        }
        salt = salt.toString("hex");
        hashPassword(newPassword, salt, (error, passwordHash) => {
            if(error) {
                return callback(error);
            }
            passwordHash = passwordHash.toString("hex");
            user.passwordHash = passwordHash;
            user.salt = salt;

            callback(null, user);
        });
    });
}

function createNewUser(db, username, password, name, email, callback) {
    generateSalt((error, salt) => {
        if(error) {
            return callback(error);
        }
        salt = salt.toString("hex");
        hashPassword(password, salt, (error, passwordHash) => {
            if(error) {
                return callback(error);
            }
            passwordHash = passwordHash.toString("hex");
            db.query("INSERT INTO users (username, data) VALUES ($1::text, $2::json)", [
                username,
                {
                    name,
                    email,
                    passwordHash,
                    salt,
                    createdAt: timestamp()
                }
            ], (error) => {
                if(error) {
                    return callback(error);
                }
                callback(null, { username, name, email });
            });
        });
    });
}
