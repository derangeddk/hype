const path = require("path");
const viewPath = path.join(__dirname, "view.html");
const render = require("../render");
const errorPage = require("../errorPage");

module.exports = () => (req, res) => {
    let { id } = req.params;

    render(viewPath, { campaignId: id }, (error, page) => {
        if(error) {
            console.error("Failed to render campaign view page", error);
            return res.send(errorPage(500));
        }
        res.send(page);
    });
}
