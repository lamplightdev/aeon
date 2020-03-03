import BaseElement from './base.js';

class DatePicker extends BaseElement {
  static get props() {
    return {
      date: {
        type: String
      },
      time: {
        type: String
      },
      value: {
        type: Object
      },
      showTime: {
        type: Boolean
      },
      confirmOnDate: {
        type: Boolean
      },
      locale: {
        type: String
      },
      dateStyle: {
        type: Object
      },
      startYear: {
        type: String
      },
      endYear: {
        type: String
      },
      startDay: {
        type: String
      },
      defaultDate: {
        type: String
      },
      defaultTime: {
        type: String
      },
      hasNative: {
        type: Boolean
      },
      useNative: {
        type: Boolean
      },
      alignTop: {
        type: Boolean
      },
      alignRight: {
        type: Boolean
      }
    };
  }

  constructor() {
    super();

    const now = new Date();

    this.showTime = false;
    this.confirmOnDate = false;
    this.alignTop = false;
    this.alignRight = false;
    this.dateStyle = {};
    this.startYear = now.getFullYear() - 100;
    this.endYear = now.getFullYear() + 5;
    this.startDay = 1;

    try {
      const input = document.createElement('input');
      input.type = 'date';
      this.hasNative = input.type === 'date';
    } catch (error) {
      this.hasNative = false;
    }

    this.onLabelClick = this.onLabelClick.bind(this);
    this.onClickOutside = this.onClickOutside.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();

    document.addEventListener('click', this.onClickOutside);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this._dateInput) {
      [...(this._dateInput.labels || [])].forEach(labelEl => {
        labelEl.removeEventListener('click', this.onLabelClick);
      });
    }
    document.removeEventListener('click', this.onClickOutside);
  }

  firstRender(_) {
    const template = document.createElement('template');
    template.innerHTML = `
      <style>
        :host {
          position: relative;
          display: inline-block;

          --rgb: var(--cal-rgb, 0, 0, 0);
          --bgRgb: var(--cal-bg-rgb, 248, 248, 248);
          --color: rgb(var(--rgb));
          --hintColor: rgba(var(--rgb), 0.2);
          --bgColor: rgb(var(--bgRgb));

          color: var(--color);
        }

        slot:not([name]) {
          display: none;
        }

        :host([has-native][use-native]) slot {
          display: none;
        }

        :host([has-native][use-native]) slot:not([name]) {
          display: contents;
        }

        aeon-calendar {
          position: absolute;
          top: 100%;
          left: 0;
        }

        :host([align-top]) aeon-calendar {
          top: auto;
          bottom: 100%;
        }

        :host([align-right]) aeon-calendar {
          left: auto;
          right: 0;
        }

        @media (max-width: 640px) {
          aeon-calendar,
          :host([align-top]) aeon-calendar,
          :host([align-right]) aeon-calendar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
          }
        }
      </style>

      <slot></slot>
      <slot name="output"></slot>

      <aeon-calendar id="calendar"></aeon-calendar>
    `;

    window.ShadyCSS && ShadyCSS.prepareTemplate(template, 'aeon-datepicker');
    window.ShadyCSS && ShadyCSS.styleElement(this);
    _.appendChild(template.content.cloneNode(true));
  }

  firstRendered(_) {
    const slot = _.querySelector('slot');
    slot.addEventListener('slotchange', event => {
      const elements = slot
        .assignedNodes()
        .filter(el => el.nodeType != Node.TEXT_NODE);
      this._dateInput = elements.find(el => el.getAttribute('type') === 'date');

      if (this._dateInput) {
        this._output.placeholder = this._dateInput.placeholder;
        (this._dateInput.labels || []).forEach(labelEl => {
          labelEl.addEventListener('click', this.onLabelClick);
        });
        this.date = this._dateInput.value;
      }

      this._timeInput = elements.find(el => el.getAttribute('type') === 'time');

      if (this._timeInput) {
        this.showTime = true;
        this.time = this._timeInput.value;
      }
    });

    this._output = document.createElement('input');
    this._output.slot = 'output';
    this._output.readOnly = true;
    this._output.addEventListener('click', () => {
      this.openCalendar();
    });
    this.appendChild(this._output);

    this.addEventListener('keyup', event => {
      switch (event.key) {
        case ' ':
          if (!this.$.calendar.open) {
            this.openCalendar();
          }
          break;
      }
    });

    this.$.calendar.addEventListener('change', event => {
      this.date = event.target.value.date;
      this.time = event.target.value.time;
      this.closeCalendar();
    });

    this.$.calendar.addEventListener('clear', () => {
      this.date = '';
    });

    this.$.calendar.addEventListener('close', () => {
      if (!this._dontFocus) {
        this._output.focus();
      }

      this._dontFocus = false;
    });
  }

  render(_, triggers) {
    if ('date' in triggers || 'time' in triggers) {
      this.value = {
        date: this.date,
        time: this.time
      };

      this.updateFromString(this.date, this.time);

      this.dispatchEvent(
        new Event('change', {
          bubbles: true
        })
      );
    }

    if (
      'locale' in triggers ||
      'startYear' in triggers ||
      'endYear' in triggers ||
      'startDay' in triggers ||
      'showTime' in triggers ||
      'confirmOnDate' in triggers
    ) {
      this.updateFromString(this.date, this.time);
    }
  }

  update(date = null) {
    const validDate = date && !isNaN(date);
    let showDate = date;

    if (!validDate) {
      const date = this.defaultDate;
      const time = this.defaultTime;
      showDate = this.parseDate(date, time);
    }

    const cal = this.$.calendar;
    cal.year = showDate.getFullYear();
    cal.month = showDate.getMonth();
    cal.day = showDate.getDate();
    cal.hours = showDate.getHours();
    cal.minutes = showDate.getMinutes();
    cal.locale = this.locale;
    cal.startYear = this.startYear;
    cal.endYear = this.endYear;
    cal.startDay = this.startDay;
    cal.showTime = this.showTime;
    cal.confirmOnDate = this.confirmOnDate;

    if (validDate) {
      const dateString = new Intl.DateTimeFormat(this.locale || undefined, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        ...(this.showTime
          ? {
              hour: 'numeric',
              minute: 'numeric'
            }
          : {}),
        ...this.dateStyle
      }).format(date);

      this._output.value = dateString;
      if (this._dateInput) {
        this._dateInput.value = this.date;
      }
      if (this._timeInput) {
        this._timeInput.value = this.time;
      }
    } else {
      this._output.value = '';
      if (this._dateInput) {
        this._dateInput.value = '';
      }
      if (this._timeInput) {
        this._timeInput.value = '';
      }
    }
  }

  openCalendar() {
    const rect = this.getBoundingClientRect();
    const fromTop = rect.top;
    const fromBottom = window.innerHeight - rect.bottom;
    const fromLeft = rect.left;
    const fromRight = window.innerWidth - rect.right;

    this.alignTop = fromBottom < fromTop;
    this.alignRight = fromRight < fromLeft;

    this.$.calendar.open = true;
  }

  closeCalendar(dontFocus = false) {
    this.$.calendar.open = false;

    this._dontFocus = dontFocus;
  }

  parseDate(date, time) {
    try {
      const dateParts = date.split('-');
      const timeParts = (time || this.defaultTime || '00:00').split(':');

      return new Date(
        dateParts[0],
        parseInt(dateParts[1], 10) - 1,
        dateParts[2],
        timeParts[0],
        timeParts[1]
      );
    } catch (error) {
      return new Date();
    }
  }

  updateFromString(date, time) {
    this.update(this.parseDate(date, time));
  }

  onLabelClick(event) {
    if (!this.useNative || !this.hasNative) {
      event.preventDefault();
      this._output.focus();
    }
  }

  onClickOutside(event) {
    if (this.$.calendar.open) {
      const outsideComponent = !event
        .composedPath()
        .some(element => element === this);

      if (outsideComponent) {
        this.closeCalendar(true);
      }
    }
  }
}

export default DatePicker;
