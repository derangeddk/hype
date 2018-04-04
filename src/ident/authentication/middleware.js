const timestamp = require("../../utils/timestamp");

module.exports = (authRepository) => (req, res, next) => {
    let authentication = req.get("X-Auth-Token");
    if(!authentication) {
        return res.status(401).send({ error: "You must authenticate to perform this action." });
    }
    authRepository.validateAuthentication(authentication, (error, username) => {
        if(error && ["NotFound", "Expired"].includes(error.type)) {
            return res.status(401).send({ error: "You must authenticate to perform this action." });
        }
        if(error) {
            console.error("Failed to validate authentication", error);
            return res.status(500).send({ error: "Failed to authenticate" });
        }
        req.username = username;
        next();
    });
};
