const ensureDb = require("../../utils/ensureDb");
const rowToCampaign = require("./rowToCampaign");
const uuid = require("uuid");
const timestamp = require("../../utils/timestamp");

module.exports = (db) => {
    //Ensure campaign db
    ensureDb(db, "campaigns (id uuid NOT NULL, data json NOT NULL)", (error) => {
        if(error) {
            console.error("Failed to create campaigns table.", error);
            process.exit(1);
        }
    });

    return {
        create: (name, confirmationUrl, callback) => {
            let id = uuid.v4();
            let data = { name, subscribers: [], createdAt: timestamp() };

            if(confirmationUrl) {
                data.confirmationUrl = confirmationUrl;
            }

            db.query("INSERT INTO campaigns (id, data) VALUES ($1::uuid, $2::json)", [ id, data ], (error) => {
                if(error) {
                    return callback(error);
                }
                callback(null, { id, name, subscribers: 0 });
            });
        },
        get: (id, callback) => {
            db.query("SELECT * FROM campaigns WHERE id=$1::uuid", [ id ], (error, result) => {
                if(error) {
                    return callback(error);
                }
                if(!result.rows.length) {
                    return callback({
                        type: "NotFound",
                        trace: new Error("No such campaign"),
                        campaignId: id
                    });
                }

                callback(null, rowToCampaign(result.rows[0]));
            });
        },
        list: (callback) => {
            db.query("SELECT * FROM campaigns", (error, data) => {
                if(error) {
                    return callback(error);
                }
                callback(null, data.rows.map(rowToCampaign));
            });
        },
        update: (id, data, callback) => {
            if(data.id) {
                delete data.id;
            }
            db.query("UPDATE campaigns SET data=$2::json WHERE id=$1::uuid", [ id, data ], callback);
        }
    };
};
