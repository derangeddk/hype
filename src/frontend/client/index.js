module.exports = (request) => {
    let auth = null;

    let r = (method, endpoint, data, callback) => {
        if(!callback) {
            callback = data;
            data = null;
        }
        request(method, endpoint, data, auth, callback);
    }

    return {
        auth: (username, password, callback) => callback(), //TODO
        campaign: {
            create: (name, callback) => r("POST", "/campaign", { name }, callback),
            subscribe: (campaignId, name, email, callback) => r("POST", `/campaign/${campaignId}/subscriber`, { name, email }, callback),
            confirmSubscription: (campaignId, subscriberId, callback) => r("PUT", `/campaign/${campaignId}/subscriber/${subscriberId}`, { status: "confirmed" }, callback),
            unsubscribe: (campaignId, subscriberId, callback) => r("PUT", `/campaign/${campaignId}/subscriber/${subscriberId}`, { status: "unsubscribed" }, callback),
            list: (callback) => r("GET", `/campaign`, callback),
            listSubscribers: (campaignId, callback) => r("GET", `/campaign/${campaignId}/subscriber`, callback),
            listConfirmedSubscribers: (campaignId, callback) => r("GET", `/campaign/${campaignId}/subscriber?status=confirmed`, callback)
        }
    }
};
