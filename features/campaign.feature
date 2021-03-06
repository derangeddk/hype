Feature: Campaign
    As an email campaign manager
    I want to manage campaigns and sign up subscribers
    In order to facilitate communication to subscribers

    Scenario: Create campaign
        Given I authenticate as the user "admin" with password "admin"
        When I create a campaign "Curling Enthusiasts" with confirmation URL "http://example.website"
        Then I have 1 campaign, including the following:
        | name                | subscribers | confirmationUrl        |
        | Curling Enthusiasts | 0           | http://example.website |

    Scenario: List campaigns
        Given I authenticate as the user "admin" with password "admin"
        And a campaign "Curling Enthusiasts" exists
        And a campaign "High-Roping Huskies" exists
        When I list all campaigns
        Then I receive the following list:
        | name                 |
        | Curling Enthusiasts  |
        | High-Roping Huskies  |

    Scenario: Sign up for campaign
        Given a campaign "Curling Enthusiasts" exists
        When I sign up for the "Curling Enthusiasts" campaign with the following information:
        | name  | email             |
        | Niels | niels@deranged.dk |
        Then the following campaign exists:
        | name                | subscribers |
        | Curling Enthusiasts | 0           |
        And the subscribers to the "Curling Enthusiasts" campaign are:
        | name  | email             | status  |
        | Niels | niels@deranged.dk | pending |
        And an email has been sent to niels@deranged.dk

    Scenario: Confirm signup for campaign
        Given a campaign "Curling Enthusiasts" exists
        And the following users have signed up for the "Curling Enthusiasts" campaign:
        | name    | email                |
        | Niels   | niels@deranged.dk    |
        | Asbjørn | asbjoern@deranged.dk |
        When I confirm the subscription for niels@deranged.dk to the "Curling Enthusiasts" campaign
        Then the subscribers to the "Curling Enthusiasts" campaign are:
        | name    | email                | status    |
        | Niels   | niels@deranged.dk    | confirmed |
        | Asbjørn | asbjoern@deranged.dk | pending   |

    Scenario: List all subscribers
        Given I authenticate as the user "admin" with password "admin"
        And a campaign "Curling Enthusiasts" exists
        And the following users have signed up for the "Curling Enthusiasts" campaign:
        | name    | email                |
        | Niels   | niels@deranged.dk    |
        | Asbjørn | asbjoern@deranged.dk |
        | Anders  | anders@deranged.dk   |
        And the subscription for niels@deranged.dk to the "Curling Enthusiasts" campaign is confirmed
        And the subscription for anders@deranged.dk to the "Curling Enthusiasts" campaign is confirmed
        When I list the subscribers to the "Curling Enthusiasts" campaign
        Then I receive the following list:
        | name    | email                |
        | Niels   | niels@deranged.dk    |
        | Asbjørn | asbjoern@deranged.dk |
        | Anders  | anders@deranged.dk   |

    Scenario: List confirmed subscribers
        Given I authenticate as the user "admin" with password "admin"
        And a campaign "Curling Enthusiasts" exists
        And the following users have signed up for the "Curling Enthusiasts" campaign:
        | name    | email                |
        | Niels   | niels@deranged.dk    |
        | Asbjørn | asbjoern@deranged.dk |
        | Anders  | anders@deranged.dk   |
        And the subscription for niels@deranged.dk to the "Curling Enthusiasts" campaign is confirmed
        And the subscription for anders@deranged.dk to the "Curling Enthusiasts" campaign is confirmed
        When I list the confirmed subscribers to the "Curling Enthusiasts" campaign
        Then I receive the following list:
        | name   | email              |
        | Niels  | niels@deranged.dk  |
        | Anders | anders@deranged.dk |

    Scenario: Unsubscribe from campaign
        Given a campaign "Curling Enthusiasts" exists
        And the following users have signed up for the "Curling Enthusiasts" campaign:
        | name    | email                |
        | Niels   | niels@deranged.dk    |
        | Asbjørn | asbjoern@deranged.dk |
        When I unsubscribe niels@deranged.dk from the "Curling Enthusiasts" campaign
        Then the subscribers to the "Curling Enthusiasts" campaign are:
        | name    | email                | status       |
        | Niels   | niels@deranged.dk    | unsubscribed |
        | Asbjørn | asbjoern@deranged.dk | pending      |

    Scenario: Cannot create campaign without authenticating
        When I attempt to create a campaign "Curling Enthusiasts"
        Then I am told that I must be authenticated to perform that action

    Scenario: Cannot list campaigns without authenticating
        Given a campaign "Curling Enthusiasts" exists
        And a campaign "High-Roping Huskies" exists
        When I attempt to list all campaigns
        Then I am told that I must be authenticated to perform that action

    Scenario: Cannot list subscribers without authenticating
        Given a campaign "Curling Enthusiasts" exists
        And the following users have signed up for the "Curling Enthusiasts" campaign:
        | name    | email                |
        | Niels   | niels@deranged.dk    |
        | Asbjørn | asbjoern@deranged.dk |
        | Anders  | anders@deranged.dk   |
        And the subscription for niels@deranged.dk to the "Curling Enthusiasts" campaign is confirmed
        And the subscription for anders@deranged.dk to the "Curling Enthusiasts" campaign is confirmed
        When I attempt to list the subscribers to the "Curling Enthusiasts" campaign
        Then I am told that I must be authenticated to perform that action

    Scenario: Set up mailgun config for specific campaign
        Given I authenticate as the user "admin" with password "admin"
        And a campaign "Curling Enthusiasts" exists
        When I set the following custom mailgun config for the "Curling Enthusiasts" campaign:
        | from   | domain | apiKey  |
        | x@y.z  | y.z    | somekey |
        Then the campaign "Curling Enthusiasts" has the following custom mailgun config:
        | from   | domain | apiKey  |
        | x@y.z  | y.z    | somekey |
