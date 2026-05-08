<?php

namespace Hsjes\Calendar;

use Flarum\Database\AbstractModel;
use Flarum\Discussion\Discussion;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DiscussionEvent extends AbstractModel
{
    protected $table = 'discussion_events';

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'all_day' => 'boolean',
    ];

    protected $fillable = [
        'discussion_id',
        'starts_at',
        'ends_at',
        'all_day',
    ];

    public function discussion(): BelongsTo
    {
        return $this->belongsTo(Discussion::class);
    }
}
