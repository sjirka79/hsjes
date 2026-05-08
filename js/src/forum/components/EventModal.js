import app from 'flarum/forum/app';
import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';
import flatpickr from 'flatpickr';
import { Czech } from 'flatpickr/dist/l10n/cs.js';

const FLATPICKR_OPTS = {
  locale: Czech,
  enableTime: true,
  time_24hr: true,
  dateFormat: 'Y-m-d H:i',
  altInput: true,
  altFormat: 'j. n. Y H:i',
  minuteIncrement: 15,
};

const formatForFlatpickr = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default class EventModal extends Modal {
  oninit(vnode) {
    super.oninit(vnode);
    const discussion = this.attrs.discussion;
    this.enabled = !!discussion.attribute('isEvent');
    this.startsAt = formatForFlatpickr(discussion.attribute('startsAt'));
    this.endsAt = formatForFlatpickr(discussion.attribute('endsAt'));
    this.loading = false;
  }

  onremove(vnode) {
    this.startsPicker?.destroy();
    this.endsPicker?.destroy();
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
        <div className="Form">
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
            <div className="EventModal-fields">
              <div className="Form-group">
                <label>{app.translator.trans('hsjes-calendar.forum.composer.starts_at')}</label>
                <input
                  type="text"
                  className="FormControl"
                  oncreate={(vn) => {
                    this.startsPicker = flatpickr(vn.dom, {
                      ...FLATPICKR_OPTS,
                      defaultDate: this.startsAt || null,
                      onChange: (_d, str) => { this.startsAt = str; },
                    });
                  }}
                />
              </div>
              <div className="Form-group">
                <label>
                  {app.translator.trans('hsjes-calendar.forum.composer.ends_at')}
                  {' '}
                  <span className="EventComposerControls-optional">
                    ({app.translator.trans('hsjes-calendar.forum.composer.optional')})
                  </span>
                </label>
                <input
                  type="text"
                  className="FormControl"
                  oncreate={(vn) => {
                    this.endsPicker = flatpickr(vn.dom, {
                      ...FLATPICKR_OPTS,
                      defaultDate: this.endsAt || null,
                      onChange: (_d, str) => { this.endsAt = str; },
                    });
                  }}
                />
              </div>
            </div>
          ) : null}

          <div className="Form-group">
            {Button.component(
              {
                type: 'submit',
                className: 'Button Button--primary',
                loading: this.loading,
                disabled: this.enabled && !this.startsAt,
                onclick: () => this.onsubmit(),
              },
              app.translator.trans('hsjes-calendar.forum.modal.save')
            )}
          </div>
        </div>
      </div>
    );
  }

  async onsubmit() {
    const discussion = this.attrs.discussion;
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
