# Seznam OAuth for Flarum

[![Latest Stable Version](https://img.shields.io/packagist/v/hsjes/flarum-oauth-seznam.svg)](https://packagist.org/packages/hsjes/flarum-oauth-seznam)

A [Flarum](http://flarum.org) extension that adds **Seznam.cz** as an OAuth
provider to [FriendsOfFlarum/oauth](https://github.com/FriendsOfFlarum/oauth).

## Installation

```bash
composer require hsjes/flarum-oauth-seznam
```

This package depends on `fof/oauth`, which will be installed automatically if
it is not already present.

## Setup

1. Register an application at <https://vyvojari.seznam.cz/oauth>.
2. Set the redirect URI to:
   `https://your-forum.example/auth/seznam`
3. In the Flarum admin panel, open the **FoF OAuth** extension page.
4. Enable the **Seznam.cz** provider and fill in the **Client ID** and
   **Client Secret** issued by Seznam.

The login button (`Přihlásit přes Seznam.cz` / `Log In with Seznam.cz`) will
appear on the forum sign-in form.

## OAuth details

| Property        | Value                                          |
|-----------------|------------------------------------------------|
| Authorize URL   | `https://login.szn.cz/api/v1/oauth/auth`       |
| Token URL       | `https://login.szn.cz/api/v1/oauth/token`      |
| User info URL   | `https://login.szn.cz/api/v1/user`             |
| Scope           | `identity`                                     |

The `identity` scope returns `oauth_user_id` (a stable user identifier) and
`account_name` (typically the user's `@seznam.cz` email). Flarum requires a
verified email address to register a new user; if Seznam's `account_name` is
not an email address for a given user, registration will fail. In that case,
configure your Seznam OAuth app to request the `email` scope and provide it
alongside `identity`.

## License

MIT — see [LICENSE.md](LICENSE.md).
