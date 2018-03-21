const client = require("./index");

module.exports = client((method, endpoint, data, auth, callback) => {
    //TODO: auth
    var req = new XMLHttpRequest();
    req.open(method, `/api${endpoint}`, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.onreadystatechange = function() {
        if(req.readyState != 4) {
            return;
        }
        if(req.status == 200) {
            return callback(null, JSON.parse(req.response));
        }
        callback({
            trace: new Error("Bad response from server on request"),
            status: req.statusText,
            responseType: req.responseType,
            response: req.response
        });
    };
    req.send(JSON.stringify(data));
});
