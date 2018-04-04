module.exports = (opts) => getDate(opts).toISOString();

function getDate(opts) {
    if(opts && opts.future) {
        return new Date(Date.now() + opts.future);
    }
    return new Date();
}
