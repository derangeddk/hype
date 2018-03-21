module.exports = (row, keys) => {
    let out = {};
    keys.forEach((key) => out[key] = row[key]);
    return out;
};
