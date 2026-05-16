<?php

/*
 * This file is part of hsjes/flarum-oauth-seznam.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Hsjes\OAuthSeznam\OAuth2;

use League\OAuth2\Client\Provider\AbstractProvider;
use League\OAuth2\Client\Provider\Exception\IdentityProviderException;
use League\OAuth2\Client\Token\AccessToken;
use League\OAuth2\Client\Tool\BearerAuthorizationTrait;
use Psr\Http\Message\ResponseInterface;

class SeznamProvider extends AbstractProvider
{
    use BearerAuthorizationTrait;

    public function getBaseAuthorizationUrl(): string
    {
        return 'https://login.szn.cz/api/v1/oauth/auth';
    }

    public function getBaseAccessTokenUrl(array $params): string
    {
        return 'https://login.szn.cz/api/v1/oauth/token';
    }

    public function getResourceOwnerDetailsUrl(AccessToken $token): string
    {
        return 'https://login.szn.cz/api/v1/user';
    }

    protected function getDefaultScopes(): array
    {
        return ['identity'];
    }

    protected function getScopeSeparator(): string
    {
        return ' ';
    }

    protected function checkResponse(ResponseInterface $response, $data): void
    {
        if ($response->getStatusCode() >= 400 || !empty($data['error'])) {
            $message = is_array($data)
                ? ($data['error_description'] ?? $data['error'] ?? $response->getReasonPhrase())
                : $response->getReasonPhrase();

            throw new IdentityProviderException(
                (string) $message,
                $response->getStatusCode(),
                (string) $response->getBody()
            );
        }
    }

    protected function createResourceOwner(array $response, AccessToken $token): SeznamResourceOwner
    {
        return new SeznamResourceOwner($response);
    }
}
