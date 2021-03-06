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
        auth: (username, password, callback) => {
            request("POST", "/authenticate", { username, password }, null, (error, data) => {
                if(error) {
                    return callback(error);
                }
                auth = data.authentication;
                callback();
            });
        },
        setAuthToken: (authentication) => { auth = authentication; },
        getAuthToken: () => auth,
        users: {
            create: (username, name, email, password, callback) => r("POST", "/user", { username, name, email, password }, callback),
            list: (callback) => r("GET", "/user", callback),
            update: (username, dataToUpdate, callback) => r("PUT", `/user/${username}`, dataToUpdate, callback),
            delete: (username, callback) => r("DELETE", `/user/${username}`, callback)
        },
        campaign: {
            create: (name, confirmationUrl, callback) => {
                if(!callback) {
                    callback = confirmationUrl;
                    return r("POST", "/campaign", { name }, callback);
                }
                return r("POST", "/campaign", { name, confirmationUrl }, callback)
            },
            update: (campaignId, dataToUpdate, callback) => r("PUT", `/campaign/${campaignId}`, dataToUpdate, callback),
            subscribe: (campaignId, name, email, callback) => r("POST", `/campaign/${campaignId}/subscriber`, { name, email }, callback),
            confirmSubscription: (campaignId, subscriberId, callback) => r("PUT", `/campaign/${campaignId}/subscriber/${subscriberId}`, { status: "confirmed" }, callback),
            unsubscribe: (campaignId, subscriberId, callback) => r("PUT", `/campaign/${campaignId}/subscriber/${subscriberId}`, { status: "unsubscribed" }, callback),
            list: (callback) => r("GET", `/campaign`, callback),
            listSubscribers: (campaignId, callback) => r("GET", `/campaign/${campaignId}/subscriber`, callback),
            listConfirmedSubscribers: (campaignId, callback) => r("GET", `/campaign/${campaignId}/subscriber?status=confirmed`, callback),
            setMailgunConfig: (campaignId, mailgunConfig, callback) => r("PUT", `/campaign/${campaignId}`, { mailgunConfig }, callback)
        },
        email: {
            send: (campaignId, subject, html, callback) => r("POST", `/email/send`, { campaignId, emailContent: html, subject }, callback)
        }
    }
};
