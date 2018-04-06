Feature: Send email
    As the manager of a campaign
    I want to be able to send emails to subscribers of a campaign
    In order to create hype!

    Scenario: Send email to list
        Given I authenticate as the user "admin" with password "admin"
        And a campaign "Curling Enthusiasts" exists
        And the following users have signed up for the "Curling Enthusiasts" campaign:
        | name    | email                |
        | Niels   | niels@deranged.dk    |
        | Anders  | anders@deranged.dk   |
        And the subscription for niels@deranged.dk to the "Curling Enthusiasts" campaign is confirmed
        And the subscription for anders@deranged.dk to the "Curling Enthusiasts" campaign is confirmed
        When I send an email to the "Curling Enthusiasts" campaign with the following content:
        | subject | html                                                             |
        | Hi!     | <p>Welcome to the Curling Enthusiast newsletter, {{ name }}.</p> |
        Then an email has been sent to niels@deranged.dk with the following text content:
        | Welcome to the Curling Enthusiast newsletter, {{ name }}. |
        Then an email has been sent to anders@deranged.dk with the following text content:
        | Welcome to the Curling Enthusiast newsletter, {{ name }}. |

    Scenario: Cannot send email without being authenticated
        Given a campaign "Curling Enthusiasts" exists
        And the following users have signed up for the "Curling Enthusiasts" campaign:
        | name    | email                |
        | Niels   | niels@deranged.dk    |
        | Anders  | anders@deranged.dk   |
        And the subscription for niels@deranged.dk to the "Curling Enthusiasts" campaign is confirmed
        And the subscription for anders@deranged.dk to the "Curling Enthusiasts" campaign is confirmed
        When I attempt to send an email to the "Curling Enthusiasts" campaign with the following content:
        | subject | html                                                             |
        | Hi!     | <p>Welcome to the Curling Enthusiast newsletter, {{ name }}.</p> |
        Then I am told that I must be authenticated to perform that action
