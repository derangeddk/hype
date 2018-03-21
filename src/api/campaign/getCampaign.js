const rowToCampaign = require("./rowToCampaign");

module.exports = (db, id, callback) => {
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
};