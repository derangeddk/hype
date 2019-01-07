module.exports = (repository) => (req, res) => {
    let { id } = req.params;
    let { confirmationUrl, mailgunConfig } = req.body;

    if(!confirmationUrl && !mailgunConfig) {
        return res.status(400).send({ error: "Nothing to update." });
    }
    if(confirmationUrl && !confirmationUrl.match(/^https?:\/\/.+$/)) {
        return res.status(400).send({ error: "Invalid `confirmationUrl` provided. Must be an URL." });
    }

    if(mailgunConfig) {
        if(typeof mailgunConfig !== "object") {
            return res.status(400).send({ error: "Mailgun config must be an object containing fields `from`, `domain` and `apiKey`."});
        }
        if(!mailgunConfig.from || !mailgunConfig.domain || !mailgunConfig.apiKey) {
            return res.status(400).send({ error: "Mailgun config must contain fields `from`, `domain` and `apiKey`."});
        }
        if(typeof mailgunConfig.from !== "string" || typeof mailgunConfig.domain !== "string" || typeof mailgunConfig.apiKey !== "string") {
            return res.status(400).send({
                error: "Mailgun config values must be strings, but at least one was not.",
                types: {
                    from: typeof mailgunConfig.from,
                    domain: typeof mailgunConfig.domain,
                    apiKey: typeof mailgunConfig.apiKey
                }
            });
        }
    }

    repository.get(id, (error, campaign) => {
        if(error && error.type == "NotFound") {
            return res.status(404).send({ error: "No such campaign" });
        }
        if(error) {
            console.error("Failed to get campaign data", error);
            return res.status(500).send({ error: "Failed to update campaign" });
        }

        if(confirmationUrl) {
            campaign.confirmationUrl = confirmationUrl;
        }
        if(mailgunConfig) {
            campaign.mailgunConfig = {
                from: mailgunConfig.from,
                domain: mailgunConfig.domain,
                apiKey: mailgunConfig.apiKey
            };
        }

        repository.update(id, campaign, (error) => {
            if(error && error.type == "NotFound") {
                return res.status(404).send({ error: "No such campaign" });
            }
            if(error) {
                console.error("Failed to update campaign data", error);
                return res.status(500).send({ error: "Failed to update campaign" });
            }
            res.send({ campaign });
        });
    });
};
