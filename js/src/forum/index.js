import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import DiscussionComposer from 'flarum/forum/components/DiscussionComposer';
import EditPostComposer from 'flarum/forum/components/EditPostComposer';
import DiscussionControls from 'flarum/forum/utils/DiscussionControls';
import IndexPage from 'flarum/forum/components/IndexPage';
import Button from 'flarum/common/components/Button';
import LinkButton from 'flarum/common/components/LinkButton';

import EventComposerControls from './components/EventComposerControls';
import EventModal from './components/EventModal';
import CalendarPage from './components/CalendarPage';

app.initializers.add('hsjes-calendar', () => {
  app.routes['hsjes-calendar'] = { path: '/calendar', component: CalendarPage };

  // Initialize composer state when first opened
  extend(DiscussionComposer.prototype, 'oninit', function () {
    if (typeof this.eventEnabled === 'undefined') this.eventEnabled = false;
    if (typeof this.eventStartsAt === 'undefined') this.eventStartsAt = null;
    if (typeof this.eventEndsAt === 'undefined') this.eventEndsAt = null;
  });

  // Add a toggle button to the composer header (next to "Vybrat štítky"
  // and "Přidat anketu"); when active, also render the range picker.
  extend(DiscussionComposer.prototype, 'headerItems', function (items) {
    items.add(
      'event-toggle',
      Button.component(
        {
          className: 'Button EventToggle' + (this.eventEnabled ? ' EventToggle--on' : ''),
          icon: 'fas fa-calendar-alt',
          onclick: () => {
            this.eventEnabled = !this.eventEnabled;
            if (!this.eventEnabled) {
              this.eventStartsAt = null;
              this.eventEndsAt = null;
            }
          },
        },
        app.translator.trans('hsjes-calendar.forum.composer.event_toggle_button')
      ),
      1
    );

    if (this.eventEnabled) {
      items.add('event-picker', EventComposerControls.component({ composer: this }), -10);
    }
  });

  extend(DiscussionComposer.prototype, 'data', function (data) {
    if (this.eventEnabled && this.eventStartsAt) {
      data.startsAt = this.eventStartsAt;
      data.endsAt = this.eventEndsAt || null;
    }
  });

  // When editing the first post of a discussion, expose a button
  // 'Datum události' that opens the EventModal.
  extend(EditPostComposer.prototype, 'headerItems', function (items) {
    const post = this.attrs.post;
    if (!post || post.number() !== 1) return;

    const discussion = post.discussion();
    if (!discussion || !discussion.canRename()) return;

    const isEvent = !!discussion.attribute('isEvent');

    items.add(
      'event-edit',
      Button.component(
        {
          className: 'Button EventToggle' + (isEvent ? ' EventToggle--on' : ''),
          icon: 'fas fa-calendar-alt',
          onclick: () => app.modal.show(EventModal, { discussion }),
        },
        app.translator.trans(
          isEvent
            ? 'hsjes-calendar.forum.controls.edit_event'
            : 'hsjes-calendar.forum.controls.add_event'
        )
      ),
      -10
    );
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
