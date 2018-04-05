const path = require("path");
const viewPath = path.join(__dirname, "compose.html");
const render = require("../render");
const errorPage = require("../errorPage");
const fs = require("fs");
const defaultEmailContent = fs.readFileSync(path.join(__dirname, "defaultEmailContent.html"), "utf8");

module.exports = (campaignRepository, hypeConfig) => (req, res) => {
    let { id } = req.params;

    campaignRepository.get(id, (error, campaign) => {
        if(error) {
            console.error("Failed to get campaign info for campaign", id, error);
            return errorPage(500);
        }

        let subscribers = campaign.subscribers.filter((subscriber) => subscriber.status == "confirmed");

        if(subscribers.length == 0) {
            return errorPage(400, "There are no subscribers for this list, so you cannot send them email yet.");
        }

        //Set up unsubscribe links
        subscribers = subscribers.map((subscriber) => {
            subscriber.unsubscribeLink = `${hypeConfig.baseUrl}/unsubscribe?campaign=${campaign.id}&subscriber=${subscriber.id}`;
            return subscriber;
        });

        let previewViewModel = {
            campaign: { name: campaign.name },
            ...subscribers[0]
        };
        
        let subscriberFields = {};
        subscribers.forEach((subscriber) => {
            Object.keys(subscriber).forEach((subscriberField) => {
                if(subscriberFields[subscriberField]) {
                    subscriberFields[subscriberField]++;
                }
                else {
                    subscriberFields[subscriberField] = 1;
                }
            });
        });

        let availableFields = [ { fieldAvailability: "global", fieldName: "campaign.name" } ];

        let subscriberCount = subscribers.length;
        Object.keys(subscriberFields).forEach((subscriberField) => {
            let count = subscriberFields[subscriberField];
            if(count == subscriberCount) {
                availableFields.push({ fieldAvailability: "all-have", fieldName: subscriberField });
            }
            else if(count > subscriberCount / 2) {
                availableFields.push({ fieldAvailability: "most-have", fieldName: subscriberField });
            }
            else {
                availableFields.push({ fieldAvailability: "some-have", fieldName: subscriberField });
            }
        });

        let composePageViewModel = {
            campaignId: id,
            availableFields,
            previewViewModel: JSON.stringify(previewViewModel),
            defaultEmailContent
        };

        render(viewPath, composePageViewModel, (error, page) => {
            if(error) {
                console.error("Failed to render campaign view page", error);
                return res.send(errorPage(500));
            }
            res.send(page);
        });
    });
}
