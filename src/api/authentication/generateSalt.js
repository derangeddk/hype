const crypto = require("crypto"); 

module.exports = (callback) => crypto.randomBytes(32, callback);
