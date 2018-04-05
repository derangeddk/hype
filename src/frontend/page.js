const path = require("path");
const render = require("./render");
const errorPage = require("./errorPage");

module.exports = (root) => (filePath) => (req, res) => {
    let viewPath = path.join(root, filePath);
    render(viewPath, (error, page) => {
        if(error) {
            console.error("Failed to render page " + filePath, error);
            return res.send(errorPage(500));
        }
        res.send(page);
    });
};
