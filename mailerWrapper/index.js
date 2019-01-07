const MailgunMustacheMailer = require("mailgun-mustache-mailer");

module.exports = function MailerWrapper(config) {
    let mailer = new MailgunMustacheMailer(config, { info: console.log.bind(console) });

    return {
        send: mailer.send.bind(mailer),
        sendBatch: mailer.sendBatch.bind(mailer),
        withConfig: (newConfig) => {
            return MailerWrapper({ ...config, ...newConfig });
        }
    };
};
