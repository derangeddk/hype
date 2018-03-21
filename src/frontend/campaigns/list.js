const path = require("path");
const viewPath = path.join(__dirname, "list.html");
const render = require("../render");
const errorPage = require("../errorPage");

module.exports = () => (req, res) => {
    render(viewPath, (error, page) => {
        if(error) {
            console.error("Failed to render campaigns page", error);
            return res.send(errorPage(500));
        }
        res.send(page);
    });
}
