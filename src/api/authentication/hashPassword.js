const crypto = require("crypto");

module.exports = (password, salt, callback) => crypto.pbkdf2(password, salt, 10000, 32, 'sha256', callback);
