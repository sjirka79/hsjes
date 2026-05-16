<?php

/*
 * This file is part of hsjes/flarum-oauth-seznam.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Hsjes\OAuthSeznam\OAuth2;

use League\OAuth2\Client\Provider\ResourceOwnerInterface;

class SeznamResourceOwner implements ResourceOwnerInterface
{
    /**
     * @var array<string, mixed>
     */
    protected array $response;

    /**
     * @param array<string, mixed> $response
     */
    public function __construct(array $response)
    {
        $this->response = $response;
    }

    public function getId(): ?string
    {
        $id = $this->response['oauth_user_id'] ?? null;

        return $id !== null ? (string) $id : null;
    }

    public function getName(): ?string
    {
        return $this->response['account_name'] ?? null;
    }

    /**
     * Seznam returns the user's login as `account_name`, which for Seznam.cz
     * accounts is normally an email address. If a separate `email` field is
     * provided (when additional scopes are granted), prefer that.
     */
    public function getEmail(): ?string
    {
        if (!empty($this->response['email'])) {
            return $this->response['email'];
        }

        $accountName = $this->response['account_name'] ?? null;

        if ($accountName && filter_var($accountName, FILTER_VALIDATE_EMAIL)) {
            return $accountName;
        }

        return null;
    }

    public function getNickname(): ?string
    {
        $accountName = $this->response['account_name'] ?? null;

        if ($accountName && filter_var($accountName, FILTER_VALIDATE_EMAIL)) {
            return explode('@', $accountName)[0];
        }

        return $accountName;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return $this->response;
    }
}
