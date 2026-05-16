<?php

/*
 * This file is part of hsjes/flarum-oauth-seznam.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Hsjes\OAuthSeznam\Provider;

use Flarum\Forum\Auth\Registration;
use FoF\OAuth\Provider;
use Hsjes\OAuthSeznam\OAuth2\SeznamProvider;
use League\OAuth2\Client\Provider\AbstractProvider;

class Seznam extends Provider
{
    public function name(): string
    {
        return 'seznam';
    }

    public function link(): string
    {
        return 'https://vyvojari.seznam.cz/oauth';
    }

    public function icon(): string
    {
        return 'SeznamIcon';
    }

    public function fields(): array
    {
        return [
            'client_id'     => 'required',
            'client_secret' => 'required',
        ];
    }

    public function provider(string $redirectUri): AbstractProvider
    {
        return new SeznamProvider([
            'clientId'     => $this->getSetting('client_id'),
            'clientSecret' => $this->getSetting('client_secret'),
            'redirectUri'  => $redirectUri,
        ]);
    }

    public function options(): array
    {
        return [
            'scope' => ['identity'],
        ];
    }

    public function suggestions(Registration $registration, $user, string $token)
    {
        $this->verifyEmail($email = $user->getEmail());

        $registration
            ->provideTrustedEmail($email)
            ->suggestUsername($user->getNickname() ?: '')
            ->setPayload($user->toArray());
    }
}
