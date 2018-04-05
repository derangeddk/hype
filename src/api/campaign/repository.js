const ensureDb = require("../../utils/ensureDb");
const rowToCampaign = require("./rowToCampaign");

module.exports = (db) => {
    //Ensure campaign db
    ensureDb(db, "campaigns (id uuid NOT NULL, data json NOT NULL)", (error) => {
        if(error) {
            console.error("Failed to create campaigns table.", error);
            process.exit(1);
        }
    });

    return {
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
        }
    };
};
