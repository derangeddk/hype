Feature: Users
    As the administrator of an instance of hype
    I want to be able to manage users in the system
    In order to limit access to the system's data to individuals I trust

    Scenario: Create user
        Given I authenticate as the user "admin" with password "admin"
        When I create a user with the following information:
        | username | name  | email             | password           |
        | niels    | Niels | niels@deranged.dk | niels has a secret |
        Then the following users exist:
        | username | name  | email             |
        | niels    | Niels | niels@deranged.dk |
        And I should be able to authenticate as user "niels" with password "niels has a secret"

    Scenario: Change user information
        Given I authenticate as the user "admin" with password "admin"
        And the following users have been created:
        | username | name   | email              | password            |
        | niels    | Niels  | niels@deranged.dk  | niels has a secret  |
        | anders   | Anders | anders@deranged.dk | anders has a secret |
        When I change the following information for the user "anders":
        | email            | password                |
        | mr.a@deranged.dk | i made an anders secret |
        Then the following users exist:
        | username | name   | email             |
        | niels    | Niels  | niels@deranged.dk |
        | anders   | Anders | mr.a@deranged.dk  |
        And I should be able to authenticate as user "anders" with password "i made an anders secret"

    Scenario: Delete user
        Given I authenticate as the user "admin" with password "admin"
        And the following users have been created:
        | username | name   | email              | password            |
        | niels    | Niels  | niels@deranged.dk  | niels has a secret  |
        | anders   | Anders | anders@deranged.dk | anders has a secret |
        When I delete the user "anders"
        Then the following users exist:
        | username | name   | email             |
        | niels    | Niels  | niels@deranged.dk |

    Scenario: Cannot create user without authenticating
        When I attempt to create a user with the following information:
        | username | name  | email             | password           |
        | niels    | Niels | niels@deranged.dk | niels has a secret |
        Then I am told that I must be authenticated to perform that action

    Scenario: Cannot change user information without authenticating
        Given the following users have been created:
        | username | name   | email              | password            |
        | niels    | Niels  | niels@deranged.dk  | niels has a secret  |
        | anders   | Anders | anders@deranged.dk | anders has a secret |
        When I attempt to change the following information for the user "anders":
        | email            | password                |
        | mr.a@deranged.dk | i made an anders secret |
        Then I am told that I must be authenticated to perform that action

    Scenario: Cannot delete user without authenticating
        Given the following users have been created:
        | username | name   | email              | password            |
        | niels    | Niels  | niels@deranged.dk  | niels has a secret  |
        | anders   | Anders | anders@deranged.dk | anders has a secret |
        When I attempt to delete the user "anders"
        Then I am told that I must be authenticated to perform that action
