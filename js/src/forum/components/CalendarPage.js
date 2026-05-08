import app from 'flarum/forum/app';
import Page from 'flarum/common/components/Page';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import csLocale from '@fullcalendar/core/locales/cs';
import flatpickr from 'flatpickr';
import { Czech } from 'flatpickr/dist/l10n/cs.js';
import monthSelectPlugin from 'flatpickr/dist/plugins/monthSelect/index.js';
import 'flatpickr/dist/plugins/monthSelect/style.css';

import UpcomingList, { fmtMonthYear } from './UpcomingList';

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);

const addMonths = (d, n) => {
  const r = new Date(d.getTime());
  r.setMonth(r.getMonth() + n);
  return r;
};

const LIST_MONTHS = 6;

export default class CalendarPage extends Page {
  oninit(vnode) {
    super.oninit(vnode);
    app.history.push('hsjes-calendar', app.translator.trans('hsjes-calendar.forum.page.title'));
    this.bodyClass = 'App--calendar';

    this.mode = window.matchMedia('(max-width: 600px)').matches ? 'list' : 'month';
    this.currentDate = startOfMonth(new Date());
  }

  view() {
    return (
      <div className="CalendarPage">
        <div className="container">
          <h1 className="CalendarPage-title">
            {app.translator.trans('hsjes-calendar.forum.page.title')}
          </h1>

          <div className="CalendarPage-toolbar">
            <div className="CalendarPage-nav">
              <button className="Button" onclick={() => this.navigate('prev')}>‹</button>
              <button className="Button" onclick={() => this.navigate('next')}>›</button>
              <button className="Button" onclick={() => this.navigate('today')}>
                {app.translator.trans('hsjes-calendar.forum.page.today')}
              </button>
            </div>

            <div
              className="CalendarPage-titleText"
              onclick={(e) => this.openTitlePicker(e.currentTarget)}
            >
              {this.titleText()}
            </div>

            <div className="CalendarPage-modes">
              <button
                className={'Button' + (this.mode === 'month' ? ' Button--primary' : '')}
                onclick={() => this.setMode('month')}
              >
                {app.translator.trans('hsjes-calendar.forum.page.month')}
              </button>
              <button
                className={'Button' + (this.mode === 'list' ? ' Button--primary' : '')}
                onclick={() => this.setMode('list')}
              >
                {app.translator.trans('hsjes-calendar.forum.page.list')}
              </button>
            </div>
          </div>

          {this.mode === 'month' ? (
            <div
              className="CalendarPage-month"
              oncreate={(vn) => this.mountCalendar(vn.dom)}
              onremove={() => {
                this.calendar?.destroy();
                this.calendar = null;
              }}
            />
          ) : (
            <UpcomingList from={this.currentDate} months={LIST_MONTHS} />
          )}
        </div>
      </div>
    );
  }

  onremove() {
    this.calendar?.destroy();
    this.titlePicker?.destroy();
  }

  titleText() {
    if (this.mode === 'month') {
      return fmtMonthYear(this.currentDate);
    }
    const end = addMonths(this.currentDate, LIST_MONTHS - 1);
    const sMonth = this.currentDate.toLocaleDateString('cs-CZ', { month: 'long' });
    const eMonth = end.toLocaleDateString('cs-CZ', { month: 'long' });
    if (this.currentDate.getFullYear() === end.getFullYear()) {
      return `${sMonth} – ${eMonth} ${this.currentDate.getFullYear()}`;
    }
    return `${sMonth} ${this.currentDate.getFullYear()} – ${eMonth} ${end.getFullYear()}`;
  }

  navigate(dir) {
    if (dir === 'prev') {
      this.currentDate = addMonths(this.currentDate, -1);
    } else if (dir === 'next') {
      this.currentDate = addMonths(this.currentDate, 1);
    } else if (dir === 'today') {
      this.currentDate = startOfMonth(new Date());
    }
    if (this.calendar) this.calendar.gotoDate(this.currentDate);
  }

  setMode(mode) {
    if (this.mode === mode) return;
    this.mode = mode;
  }

  mountCalendar(el) {
    this.calendar = new Calendar(el, {
      plugins: [dayGridPlugin],
      initialView: 'dayGridMonth',
      initialDate: this.currentDate,
      locale: csLocale,
      timeZone: 'Europe/Prague',
      firstDay: 1,
      headerToolbar: false,
      titleFormat: { year: 'numeric', month: 'long' },
      height: 'auto',
      eventClick: (info) => {
        info.jsEvent.preventDefault();
        if (info.event.url) m.route.set(info.event.url);
      },
      events: (fetchInfo, success, failure) => this.fetchEvents(fetchInfo, success, failure),
      datesSet: (arg) => {
        const newDate = startOfMonth(arg.view.currentStart);
        if (+newDate !== +this.currentDate) {
          this.currentDate = newDate;
          m.redraw();
        }
      },
    });
    this.calendar.render();
  }

  openTitlePicker(anchor) {
    if (this.titlePicker) {
      this.titlePicker.setDate(this.currentDate, false);
      this.titlePicker.open();
      return;
    }

    const tempInput = document.createElement('input');
    tempInput.type = 'text';
    tempInput.style.cssText = 'position:absolute;width:0;height:0;opacity:0;pointer-events:none;';
    document.body.appendChild(tempInput);

    this.titlePicker = flatpickr(tempInput, {
      locale: Czech,
      defaultDate: this.currentDate,
      plugins: [
        new monthSelectPlugin({ shorthand: false, dateFormat: 'Y-m', altFormat: 'F Y' }),
      ],
      positionElement: anchor,
      onChange: (dates) => {
        if (dates[0]) {
          this.currentDate = startOfMonth(dates[0]);
          if (this.calendar) this.calendar.gotoDate(this.currentDate);
          m.redraw();
        }
      },
    });
    this.titlePicker.open();
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
