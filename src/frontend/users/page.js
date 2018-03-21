const path = require("path");
const viewPath = path.join(__dirname, "view.html");
const render = require("../render");
const errorPage = require("../errorPage");

module.exports = () => (req, res) => {
    render(viewPath, (error, page) => {
        if(error) {
            console.error("Failed to render users page", error);
            return res.send(errorPage(500));
        }
        res.send(page);
    });
}
