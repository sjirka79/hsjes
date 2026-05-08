import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import DiscussionComposer from 'flarum/forum/components/DiscussionComposer';

import EventComposerControls from './components/EventComposerControls';

app.initializers.add('hsjes-calendar', () => {
  extend(DiscussionComposer.prototype, 'headerItems', function (items) {
    items.add(
      'event',
      EventComposerControls.component({ composer: this }),
      -10
    );
  });

  extend(DiscussionComposer.prototype, 'data', function (data) {
    if (this.eventEnabled && this.eventStartsAt) {
      data.startsAt = this.eventStartsAt;
      data.endsAt = this.eventEndsAt || null;
    }
  });
});
