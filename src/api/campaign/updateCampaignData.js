module.exports = (db, id, data, callback) => {
    if(data.id) {
        delete data.id;
    }
    db.query("UPDATE campaigns SET data=$2::json WHERE id=$1::uuid", [ id, data ], callback);
};
