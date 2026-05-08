import app from 'flarum/forum/app';
import Page from 'flarum/common/components/Page';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import csLocale from '@fullcalendar/core/locales/cs';

export default class CalendarPage extends Page {
  oninit(vnode) {
    super.oninit(vnode);
    app.history.push('hsjes-calendar', app.translator.trans('hsjes-calendar.forum.page.title'));
    this.bodyClass = 'App--calendar';
  }

  view() {
    return (
      <div className="CalendarPage">
        <div className="container">
          <h1 className="CalendarPage-title">
            {app.translator.trans('hsjes-calendar.forum.page.title')}
          </h1>
          <div
            className="CalendarPage-calendar"
            oncreate={(vn) => this.mountCalendar(vn.dom)}
            onremove={() => this.calendar?.destroy()}
          />
          {this.loading ? <LoadingIndicator /> : null}
        </div>
      </div>
    );
  }

  mountCalendar(el) {
    const isMobile = window.matchMedia('(max-width: 600px)').matches;

    this.calendar = new Calendar(el, {
      plugins: [dayGridPlugin, listPlugin],
      initialView: isMobile ? 'listMonth' : 'dayGridMonth',
      locale: csLocale,
      timeZone: 'Europe/Prague',
      firstDay: 1,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,listMonth',
      },
      buttonText: {
        today: 'dnes',
        month: 'měsíc',
        list: 'seznam',
      },
      height: 'auto',
      eventClick: (info) => {
        info.jsEvent.preventDefault();
        if (info.event.url) {
          m.route.set(info.event.url);
        }
      },
      events: (fetchInfo, success, failure) => this.fetchEvents(fetchInfo, success, failure),
    });

    this.calendar.render();
  }

  async fetchEvents(fetchInfo, success, failure) {
    try {
      const response = await app.request({
        method: 'GET',
        url: `${app.forum.attribute('apiUrl')}/calendar`,
        params: {
          filter: {
            from: fetchInfo.startStr,
            to: fetchInfo.endStr,
          },
        },
      });

      const discussions = app.store.pushPayload(response);

      const events = discussions.map((d) => {
        const tag = (d.tags && d.tags() && d.tags()[0]) || null;
        return {
          id: d.id(),
          title: d.title(),
          start: d.attribute('startsAt'),
          end: d.attribute('endsAt'),
          url: app.route.discussion(d),
          backgroundColor: tag ? tag.color() : undefined,
          borderColor: tag ? tag.color() : undefined,
        };
      });

      success(events);
    } catch (err) {
      failure(err);
    }
  }
}
