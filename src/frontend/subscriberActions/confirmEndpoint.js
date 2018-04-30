const page = require("../page")(__dirname);
module.exports = (campaignRepository) => (req, res) => {
    let { campaign, subscriber } = req.query;

    if(!campaign || !subscriber) {
        return res.status(400).send({ error: "Missing campaign or subscriber ids" });
    }

    campaignRepository.changeSubscriptionStatus(campaign, subscriber, "confirmed", (error, subscriber, campaign) => {
        if(error && error.type == "NotFound") {
            return res.errorPage(404, `We could not find the subscriber (id ${subscriber} in campaign ${campaign}) to confirm a subscription for.`);
        }
        if(error && error.type == "InvalidTransition") {
            return res.errorPage(400, `The subscription could not be confirmed. It has either already been confirmed, or the subscription has been removed from the system.`);
        }
        if(error) {
            console.error("Failed to change subscription status", error, id, subscriberId);
            return res.errorPage(500, "Failed to confirm subscription. Refresh the page to try again.");
        }

        if(campaign.confirmationUrl) {
            return res.redirect(campaign.confirmationUrl);
        }

        page("confirmView.html")(req, res);
    });
};
