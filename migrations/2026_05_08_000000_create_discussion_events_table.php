<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        $schema->create('discussion_events', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('discussion_id')->unique();
            $table->dateTime('starts_at');
            $table->dateTime('ends_at')->nullable();
            $table->boolean('all_day')->default(false);
            $table->timestamps();

            $table->foreign('discussion_id')
                ->references('id')->on('discussions')
                ->onDelete('cascade');
        });
    },
    'down' => function (Builder $schema) {
        $schema->dropIfExists('discussion_events');
    },
];
