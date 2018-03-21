const path = require("path");
const fs = require("fs");
const layoutsDir = path.join(__dirname, "layouts");
const frontMatter = require("front-matter");
const mustache = require("mustache");

const cachedViews = {};

module.exports = resolveAndRenderView;

function resolveAndRenderView(view, viewModel, callback) {
    if(!callback) {
        callback = viewModel;
        viewModel = null;
    }
    ensureViewString(view, (error, view) => {
        if(error) {
            return callback(error);
        }
        renderView(view, viewModel, callback);
    });
};

function ensureViewString(view, callback) {
    if(cachedViews[view]) {
        return callback(null, cachedViews[view]);
    }
    return fs.readFile(view, 'utf8', (error, viewString) => {
        if(error) {
            return callback(error);
        }
        cachedViews[view] = viewString;
        callback(null, viewString);
    });
}

function renderView(view, viewModel, callback) {
    renderContainingLayouts(view, (error, fullView) => {
        if(error) {
            return callback(error);
        }
        if(viewModel) {
            return callback(null, mustache.render(fullView, viewModel));
        }
        callback(null, fullView);
    });
}

function renderContainingLayouts(view, callback) {
    if(view.substring(0,3) != "---") {
        return callback(null, view);
    }
    
    let parsed = frontMatter(view);
    //TODO: more attribute support? Right now just layout.
    let { layout } = parsed.attributes;
    if(!layout) {
        return callback(null, parsed.body);
    }

    let layoutPath = path.join(layoutsDir, layout + ".html");
    resolveAndRenderView(layoutPath, { content: parsed.body }, callback);
}
