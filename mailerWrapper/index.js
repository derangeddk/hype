const MailgunMustacheMailer = require("mailgun-mustache-mailer");

module.exports = function MailerWrapper(config) {
    let mailer = new MailgunMustacheMailer(config, { info: console.log.bind(console) });

    return {
        send: (template, recipient, callback) => mailer.send(template, recipient, callback),
        sendBatch: (template, recipients, callback) => mailer.sendBatch(template, recipients, callback),
        withConfig: (newConfig) => {
            return MailerWrapper({ ...config, ...newConfig });
        }
    };
};
