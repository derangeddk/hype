const pickKeys = require("../../utils/pickKeys");

module.exports = (row) => {
    let data = pickKeys(row.data, ["name", "subscribers", "confirmationUrl"]);
    data.id = row.id;
    return data;
};
