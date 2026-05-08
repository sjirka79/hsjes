import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import DiscussionComposer from 'flarum/forum/components/DiscussionComposer';
import DiscussionControls from 'flarum/forum/utils/DiscussionControls';
import IndexPage from 'flarum/forum/components/IndexPage';
import Button from 'flarum/common/components/Button';
import LinkButton from 'flarum/common/components/LinkButton';

import EventComposerControls from './components/EventComposerControls';
import EventModal from './components/EventModal';
import CalendarPage from './components/CalendarPage';

app.initializers.add('hsjes-calendar', () => {
  app.routes['hsjes-calendar'] = { path: '/calendar', component: CalendarPage };

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

  extend(IndexPage.prototype, 'navItems', function (items) {
    items.add(
      'calendar',
      LinkButton.component(
        {
          href: app.route('hsjes-calendar'),
          icon: 'fas fa-calendar-alt',
        },
        app.translator.trans('hsjes-calendar.forum.page.title')
      ),
      95
    );
  });
});
