<?php

namespace Hsjes\Calendar;

use Flarum\Api\Controller\ListDiscussionsController;
use Flarum\Api\Controller\ShowDiscussionController;
use Flarum\Api\Serializer\DiscussionSerializer;
use Flarum\Discussion\Discussion;
use Flarum\Discussion\Event\Saving;
use Flarum\Extend;
use Hsjes\Calendar\Api\Controller\ListCalendarController;
use Hsjes\Calendar\Listener\SaveEventToDatabase;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less')
        ->route('/calendar', 'hsjes-calendar'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js'),

    new Extend\Locales(__DIR__.'/locale'),

    (new Extend\Model(Discussion::class))
        ->relationship('event', function (Discussion $discussion) {
            return $discussion->hasOne(DiscussionEvent::class);
        }),

    (new Extend\ApiSerializer(DiscussionSerializer::class))
        ->attributes(function (DiscussionSerializer $serializer, Discussion $discussion): array {
            $event = $discussion->event;

            return [
                'isEvent' => $event !== null,
                'startsAt' => $event ? $serializer->formatDate($event->starts_at) : null,
                'endsAt' => $event && $event->ends_at ? $serializer->formatDate($event->ends_at) : null,
            ];
        }),

    (new Extend\ApiController(ShowDiscussionController::class))
        ->load(['event']),

    (new Extend\ApiController(ListDiscussionsController::class))
        ->load(['event']),

    (new Extend\Event())
        ->listen(Saving::class, SaveEventToDatabase::class),

    (new Extend\Routes('api'))
        ->get('/calendar', 'hsjes.calendar.list', ListCalendarController::class),
];
