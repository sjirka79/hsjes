<?php

namespace Hsjes\Calendar\Api\Controller;

use DateTime;
use DateTimeZone;
use Exception;
use Flarum\Api\Controller\AbstractListController;
use Flarum\Api\Serializer\DiscussionSerializer;
use Flarum\Discussion\Discussion;
use Flarum\Foundation\ValidationException;
use Flarum\Http\RequestUtil;
use Hsjes\Calendar\DiscussionEvent;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

class ListCalendarController extends AbstractListController
{
    public $serializer = DiscussionSerializer::class;

    public $include = ['user', 'firstPost', 'tags'];

    private const TZ = 'Europe/Prague';

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        $params = $request->getQueryParams();

        $tz = new DateTimeZone(self::TZ);

        try {
            $from = ($raw = Arr::get($params, 'filter.from'))
                ? new DateTime($raw, $tz)
                : (new DateTime('first day of this month', $tz))->setTime(0, 0);

            $to = ($raw = Arr::get($params, 'filter.to'))
                ? new DateTime($raw, $tz)
                : (clone $from)->modify('+3 months');
        } catch (Exception $e) {
            throw new ValidationException(['filter' => 'Neplatný formát data.']);
        }

        return Discussion::query()
            ->whereVisibleTo($actor)
            ->whereHas('event', function ($q) use ($from, $to) {
                $q->where('starts_at', '<', $to)
                    ->where(function ($q) use ($from) {
                        $q->where('ends_at', '>=', $from)
                            ->orWhere(function ($q) use ($from) {
                                $q->whereNull('ends_at')
                                    ->where('starts_at', '>=', $from);
                            });
                    });
            })
            ->with(['event', 'tags', 'user', 'firstPost'])
            ->orderBy(
                DiscussionEvent::query()
                    ->select('starts_at')
                    ->whereColumn('discussion_id', 'discussions.id')
                    ->limit(1)
            )
            ->get();
    }
}
