const mustache = require("mustache");

module.exports = (editor, preview, viewModel) => {
    let renderPreview = debounced(() => preview.innerHTML = mustache.render(editor.value, viewModel), 100);

    renderPreview();

    editor.addEventListener("keyup", (e) => {
        renderPreview();
    });
};

function debounced(fun, timeout) {
    if(!timeout) {
        timeout = 250;
    }
    var i = 0;
    return function() {
        var myI = ++i;
        var args = Array.prototype.slice.call(arguments);
        setTimeout(function() {
            if(i > myI) {
                return;
            }
            fun.apply(fun, args);
        }, timeout);
    };
}
