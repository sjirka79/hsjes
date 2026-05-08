import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import flatpickr from 'flatpickr';
import { Czech } from 'flatpickr/dist/l10n/cs.js';
import 'flatpickr/dist/flatpickr.min.css';

const FLATPICKR_OPTS = {
  locale: Czech,
  enableTime: true,
  time_24hr: true,
  dateFormat: 'Y-m-d H:i',
  altInput: true,
  altFormat: 'j. n. Y H:i',
  minuteIncrement: 15,
};

export default class EventComposerControls extends Component {
  oninit(vnode) {
    super.oninit(vnode);
    const c = this.attrs.composer;
    if (typeof c.eventEnabled === 'undefined') c.eventEnabled = !!c.eventStartsAt;
    if (typeof c.eventStartsAt === 'undefined') c.eventStartsAt = null;
    if (typeof c.eventEndsAt === 'undefined') c.eventEndsAt = null;
  }

  onremove() {
    this.startsPicker?.destroy();
    this.endsPicker?.destroy();
  }

  view() {
    const c = this.attrs.composer;

    return (
      <div className="EventComposerControls">
        <label className="EventComposerControls-toggle checkbox">
          <input
            type="checkbox"
            checked={c.eventEnabled}
            onchange={(e) => {
              c.eventEnabled = e.target.checked;
              if (!c.eventEnabled) {
                c.eventStartsAt = null;
                c.eventEndsAt = null;
              }
            }}
          />
          {' '}
          {app.translator.trans('hsjes-calendar.forum.composer.create_event')}
        </label>

        {c.eventEnabled ? (
          <div className="EventComposerControls-fields">
            <div className="Form-group EventComposerControls-field">
              <label>{app.translator.trans('hsjes-calendar.forum.composer.starts_at')}</label>
              <input
                type="text"
                className="FormControl"
                value={c.eventStartsAt || ''}
                placeholder=""
                oncreate={(vn) => {
                  this.startsPicker = flatpickr(vn.dom, {
                    ...FLATPICKR_OPTS,
                    defaultDate: c.eventStartsAt || null,
                    onChange: (_dates, str) => { c.eventStartsAt = str; },
                  });
                }}
              />
            </div>
            <div className="Form-group EventComposerControls-field">
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
                value={c.eventEndsAt || ''}
                placeholder=""
                oncreate={(vn) => {
                  this.endsPicker = flatpickr(vn.dom, {
                    ...FLATPICKR_OPTS,
                    defaultDate: c.eventEndsAt || null,
                    onChange: (_dates, str) => { c.eventEndsAt = str; },
                  });
                }}
              />
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}
