const hashPassword = require("../authentication/hashPassword");
const generateSalt = require("../authentication/generateSalt");
const timestamp = require("../timestamp");

module.exports = (db, username, password, name, email, callback) => {
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
};
