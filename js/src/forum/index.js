import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import DiscussionComposer from 'flarum/forum/components/DiscussionComposer';
import DiscussionControls from 'flarum/forum/utils/DiscussionControls';
import Button from 'flarum/common/components/Button';

import EventComposerControls from './components/EventComposerControls';
import EventModal from './components/EventModal';

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

  extend(DiscussionControls, 'moderationControls', function (items, discussion) {
    if (!discussion.canRename()) return;

    items.add(
      'event',
      Button.component(
        {
          icon: 'fas fa-calendar-alt',
          onclick: () => app.modal.show(EventModal, { discussion }),
        },
        app.translator.trans(
          discussion.attribute('isEvent')
            ? 'hsjes-calendar.forum.controls.edit_event'
            : 'hsjes-calendar.forum.controls.add_event'
        )
      )
    );
  });
});
