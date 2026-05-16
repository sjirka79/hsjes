<?php

/*
 * This file is part of hsjes/flarum-oauth-seznam.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

use Flarum\Extend;
use FoF\OAuth\Extend\RegisterProvider;
use Hsjes\OAuthSeznam\Provider\Seznam;

return [
    (new Extend\Locales(__DIR__.'/resources/locale')),

    (new Extend\Frontend('forum'))
        ->css(__DIR__.'/resources/less/forum.less'),

    (new Extend\Frontend('admin'))
        ->css(__DIR__.'/resources/less/admin.less'),

    new RegisterProvider(Seznam::class),
];
