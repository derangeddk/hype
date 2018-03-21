const generateSalt = require("../../authentication/generateSalt");
const hashPassword = require("../../authentication/hashPassword");

//TODO: support updating username
module.exports = (db) => (req, res) => {
    let { username } = req.params;
    let newData = filterKeys(req.body, [ "name", "email" ]);
    let newPassword = req.body.password;
    
    db.query("SELECT * FROM users WHERE username=$1::text", [ username ], (error, data) => {
        if(error) {
            console.error("Failed to get user data", error);
            return res.status(500).send({ error: "Failed to update user" });
        }
        if(!data.rows.length) {
            return res.status(404).send({ error: "No such user" });
        }

        updateUserData(username, data.rows[0].data, newData, newPassword, (error, user) => {
            if(error) {
                console.error("Failed to update the user data representation", error);
                return res.status(500).send({ error: "Failed to update user" });
            }
            db.query("UPDATE users SET data=$2::json WHERE username=$1::text", [ username, user ], (error) => {
                if(error) {
                    console.error("Failed to update user data", error);
                    return res.status(500).send({ error: "Failed to update user" });
                }
                res.send({ user: { username, name: user.name, email: user.email } });
            });
        });
    });
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
