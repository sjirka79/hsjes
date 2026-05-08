<?php

namespace Hsjes\Calendar;

use Flarum\Discussion\Discussion;
use Flarum\Extend;

return [
    (new Extend\Model(Discussion::class))
        ->relationship('event', function (Discussion $discussion) {
            return $discussion->hasOne(DiscussionEvent::class);
        }),
];
