<?php

namespace Hsjes\Calendar\Listener;

use DateTime;
use DateTimeZone;
use Exception;
use Flarum\Discussion\Discussion;
use Flarum\Discussion\Event\Saving;
use Flarum\Foundation\ValidationException;
use Hsjes\Calendar\DiscussionEvent;
use Illuminate\Support\Arr;

class SaveEventToDatabase
{
    private const TZ = 'Europe/Prague';

    public function handle(Saving $event): void
    {
        $attributes = Arr::get($event->data, 'attributes', []);

        if (! array_key_exists('startsAt', $attributes)
            && ! array_key_exists('endsAt', $attributes)) {
            return;
        }

        $startsAtRaw = Arr::get($attributes, 'startsAt');
        $endsAtRaw = Arr::get($attributes, 'endsAt');

        if ($startsAtRaw === null || $startsAtRaw === '') {
            $event->discussion->afterSave(function (Discussion $discussion) {
                optional($discussion->event)->delete();
            });
            return;
        }

        $tz = new DateTimeZone(self::TZ);

        try {
            $startsAt = new DateTime($startsAtRaw, $tz);
        } catch (Exception $e) {
            throw new ValidationException(['startsAt' => 'Neplatný formát data začátku.']);
        }

        $endsAt = null;
        if ($endsAtRaw !== null && $endsAtRaw !== '') {
            try {
                $endsAt = new DateTime($endsAtRaw, $tz);
            } catch (Exception $e) {
                throw new ValidationException(['endsAt' => 'Neplatný formát data konce.']);
            }

            if ($endsAt <= $startsAt) {
                throw new ValidationException(['endsAt' => 'Konec musí být později než začátek.']);
            }
        }

        $event->discussion->afterSave(function (Discussion $discussion) use ($startsAt, $endsAt) {
            $eventModel = $discussion->event ?: new DiscussionEvent();
            $eventModel->discussion_id = $discussion->id;
            $eventModel->starts_at = $startsAt;
            $eventModel->ends_at = $endsAt;
            $eventModel->all_day = false;
            $eventModel->save();
        });
    }
}
