import app from 'flarum/forum/app';
import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';
import flatpickr from 'flatpickr';
import { Czech } from 'flatpickr/dist/l10n/cs.js';

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

const isoToFlatpickr = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return formatDate(d);
};

export default class EventModal extends Modal {
  oninit(vnode) {
    super.oninit(vnode);
    const discussion = this.attrs.discussion;
    this.enabled = !!discussion.attribute('isEvent');
    this.startsAt = isoToFlatpickr(discussion.attribute('startsAt'));
    this.endsAt = isoToFlatpickr(discussion.attribute('endsAt'));
    this.loading = false;
  }

  onremove(vnode) {
    this.picker?.destroy();
    super.onremove(vnode);
  }

  className() {
    return 'EventModal Modal--small';
  }

  title() {
    return app.translator.trans('hsjes-calendar.forum.modal.title');
  }

  content() {
    return (
      <div className="Modal-body">
        <div className="Form EventModal-form">
          <div className="Form-group">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={this.enabled}
                onchange={(e) => {
                  this.enabled = e.target.checked;
                  if (!this.enabled) {
                    this.startsAt = null;
                    this.endsAt = null;
                  }
                }}
              />
              {' '}
              {app.translator.trans('hsjes-calendar.forum.modal.is_event')}
            </label>
          </div>

          {this.enabled ? (
            <div className="Form-group">
              <input
                type="text"
                className="FormControl"
                placeholder={app.translator.trans('hsjes-calendar.forum.composer.range_placeholder')}
                oncreate={(vn) => {
                  const initial = [];
                  if (this.startsAt) initial.push(this.startsAt);
                  if (this.endsAt) initial.push(this.endsAt);

                  this.picker = flatpickr(vn.dom, {
                    ...FLATPICKR_OPTS,
                    defaultDate: initial.length ? initial : null,
                    onChange: (dates) => {
                      this.startsAt = dates[0] ? formatDate(dates[0]) : null;
                      this.endsAt = dates[1] ? formatDate(dates[1]) : null;
                    },
                  });
                }}
              />
            </div>
          ) : null}

          <div className="Form-group EventModal-actions">
            {Button.component(
              {
                type: 'submit',
                className: 'Button Button--primary',
                loading: this.loading,
                disabled: this.enabled && !this.startsAt,
              },
              app.translator.trans('hsjes-calendar.forum.modal.save')
            )}
          </div>
        </div>
      </div>
    );
  }

  async onsubmit(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    const discussion = this.attrs.discussion;
    if (this.loading) return;
    this.loading = true;

    const attributes = this.enabled
      ? { startsAt: this.startsAt, endsAt: this.endsAt || null }
      : { startsAt: null, endsAt: null };

    try {
      await discussion.save(attributes);
      this.hide();
    } catch (err) {
      this.loading = false;
      m.redraw();
      throw err;
    }
  }
}
