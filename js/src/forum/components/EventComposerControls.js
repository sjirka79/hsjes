import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import flatpickr from 'flatpickr';
import { Czech } from 'flatpickr/dist/l10n/cs.js';
import 'flatpickr/dist/flatpickr.min.css';

const FLATPICKR_OPTS = {
  locale: Czech,
  mode: 'range',
  enableTime: true,
  time_24hr: true,
  dateFormat: 'Y-m-d H:i',
  altInput: true,
  altFormat: 'j. n. Y H:i',
  minuteIncrement: 15,
};

const formatDate = (d) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

export default class EventComposerControls extends Component {
  onremove() {
    this.picker?.destroy();
  }

  view() {
    const c = this.attrs.composer;
    return (
      <h3 className="EventComposerControls">
        <input
          type="text"
          className="FormControl EventComposerControls-rangeInput"
          placeholder={app.translator.trans('hsjes-calendar.forum.composer.range_placeholder')}
          oncreate={(vn) => {
            const initial = [];
            if (c.eventStartsAt) initial.push(c.eventStartsAt);
            if (c.eventEndsAt) initial.push(c.eventEndsAt);

            this.picker = flatpickr(vn.dom, {
              ...FLATPICKR_OPTS,
              defaultDate: initial.length ? initial : null,
              onChange: (dates) => {
                c.eventStartsAt = dates[0] ? formatDate(dates[0]) : null;
                c.eventEndsAt = dates[1] ? formatDate(dates[1]) : null;
              },
            });
          }}
        />
      </h3>
    );
  }
}
