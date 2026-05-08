import app from 'flarum/forum/app';
import Page from 'flarum/common/components/Page';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import csLocale from '@fullcalendar/core/locales/cs';
import flatpickr from 'flatpickr';
import { Czech } from 'flatpickr/dist/l10n/cs.js';
import monthSelectPlugin from 'flatpickr/dist/plugins/monthSelect/index.js';
import 'flatpickr/dist/plugins/monthSelect/style.css';

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
            onremove={() => {
              this.calendar?.destroy();
              this.titlePicker?.destroy();
            }}
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
        today: 'Dnes',
        month: 'Měsíc',
        list: 'Seznam',
      },
      titleFormat: { year: 'numeric', month: 'long' },
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
    this.attachTitlePicker(el);
  }

  attachTitlePicker(el) {
    const titleEl = el.querySelector('.fc-toolbar-title');
    if (!titleEl) return;

    titleEl.classList.add('CalendarPage-title-picker');

    const tempInput = document.createElement('input');
    tempInput.type = 'text';
    tempInput.className = 'CalendarPage-hiddenPicker';
    el.appendChild(tempInput);

    this.titlePicker = flatpickr(tempInput, {
      locale: Czech,
      defaultDate: this.calendar.getDate(),
      plugins: [
        new monthSelectPlugin({
          shorthand: false,
          dateFormat: 'Y-m',
          altFormat: 'F Y',
        }),
      ],
      positionElement: titleEl,
      onChange: (dates) => {
        if (dates[0]) this.calendar.gotoDate(dates[0]);
      },
    });

    titleEl.addEventListener('click', (e) => {
      e.preventDefault();
      this.titlePicker.setDate(this.calendar.getDate(), false);
      this.titlePicker.open();
    });
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
