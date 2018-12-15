H Y P E
=======

Email list management and subscription gathering as a service you run yourself.

Like all those other services, but you control all the data, and can make changes to the platform.
It's open source, you see.

**Steadily moving towards 0.1.0, which will be useful in actual production. Don't use it yet.**

Interested in the project?
Open an issue or get in touch at [niels@deranged.dk](mailto:niels@deranged.dk).
Any and all help appreciated.

## Try it!

The project comes with a Dockerfile included, which should let you easily run the project.

When running the Dockerfile you must provide the `mailgun` and `hype` config values listed in the [config file](https://github.com/derangeddk/hype/blob/master/config/custom-environment-variables.json).
This can be done by placing a file `local.json` in the same directory as the other config files, with the same structure as the others, overriding the values that need to be overridden.
Alternatively, you can provide the arguments on the commandline, e.g. for just the `hype.baseUrl` argument, write `BASEURL=http://hype.mywebsite.com node start`.

On first launch, a user `admin` will be created with password `admin`, to get you started.

In order to add a subscriber to a list, use the following request, where `{url}` is the URL of the service, and `:id` is the unique uuid of a campaign you have created (also visible in the URL from the webservice):

```
POST {url}/api/campaign/:id/subscriber
{"name":"Some user name","email":"user@email.com"}
```

No authentication is required in order to use this endpoint, and it will add the user as `pending` on the list, until their membership is confirmed.
The user will automatically receive an email to confirm membership.
