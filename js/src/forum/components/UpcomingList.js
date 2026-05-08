import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';

const fmtDate = (d) =>
  d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });

const fmtTime = (d) =>
  d.toLocaleTimeString('cs-CZ', { hour: 'numeric', minute: '2-digit' });

const fmtMonthYear = (d) =>
  d.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' });

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const sameMonthYear = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

function formatRange(start, end) {
  if (!end) return `${fmtDate(start)} ${fmtTime(start)}`;

  if (sameDay(start, end)) {
    return `${fmtDate(start)} ${fmtTime(start)} – ${fmtTime(end)}`;
  }

  if (sameMonthYear(start, end)) {
    const month = start.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' });
    return `${start.getDate()}. – ${end.getDate()}. ${month}`;
  }

  if (start.getFullYear() === end.getFullYear()) {
    const sMonth = start.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long' });
    const eMonth = end.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long' });
    return `${sMonth} – ${eMonth} ${start.getFullYear()}`;
  }

  return `${fmtDate(start)} – ${fmtDate(end)}`;
}

export default class UpcomingList extends Component {
  oninit(vnode) {
    super.oninit(vnode);
    this.events = [];
    this.loading = true;
    this.lastFromKey = null;
    this.fetch();
  }

  onbeforeupdate(vnode) {
    const fromKey = vnode.attrs.from?.toISOString?.();
    if (fromKey && fromKey !== this.lastFromKey) {
      this.attrs = vnode.attrs;
      this.fetch();
    }
  }

  async fetch() {
    const from = this.attrs.from;
    const months = this.attrs.months || 6;
    const to = new Date(from);
    to.setMonth(to.getMonth() + months);

    this.lastFromKey = from.toISOString();
    this.loading = true;

    try {
      const response = await app.request({
        method: 'GET',
        url: `${app.forum.attribute('apiUrl')}/calendar`,
        params: {
          filter: {
            from: from.toISOString(),
            to: to.toISOString(),
          },
        },
      });

      const discussions = app.store.pushPayload(response);

      this.events = discussions
        .map((d) => {
          const tag = (d.tags && d.tags() && d.tags()[0]) || null;
          return {
            id: d.id(),
            title: d.title(),
            start: new Date(d.attribute('startsAt')),
            end: d.attribute('endsAt') ? new Date(d.attribute('endsAt')) : null,
            url: app.route.discussion(d),
            color: tag ? tag.color() : null,
          };
        })
        .sort((a, b) => a.start - b.start);
    } catch (err) {
      console.error('UpcomingList: failed to fetch', err);
      this.events = [];
    }

    this.loading = false;
    m.redraw();
  }

  view() {
    if (this.loading) {
      return (
        <div className="UpcomingList UpcomingList-loading">
          <LoadingIndicator />
        </div>
      );
    }

    if (!this.events.length) {
      return (
        <div className="UpcomingList UpcomingList-empty">
          {app.translator.trans('hsjes-calendar.forum.page.empty')}
        </div>
      );
    }

    return (
      <div className="UpcomingList">
        {this.events.map((e) => (
          <a
            key={e.id}
            className="UpcomingList-event"
            href={e.url}
            onclick={(ev) => {
              ev.preventDefault();
              m.route.set(e.url);
            }}
          >
            <span
              className="UpcomingList-eventDot"
              style={e.color ? `background:${e.color}` : ''}
            />
            <span className="UpcomingList-eventDate">{formatRange(e.start, e.end)}</span>
            <span className="UpcomingList-eventTitle">{e.title}</span>
          </a>
        ))}
      </div>
    );
  }
}

export { fmtMonthYear };
