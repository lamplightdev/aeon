import AeonElement from './aeon.js';

class DatePicker extends AeonElement {
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
      showtime: {
        type: Boolean
      },
      confirmondate: {
        type: Boolean
      },
      locale: {
        type: String
      },
      datestyle: {
        type: String
      },
      startyear: {
        type: String
      },
      endyear: {
        type: String
      },
      startday: {
        type: String
      },
      defaultdate: {
        type: String
      },
      defaulttime: {
        type: String
      },
      usenative: {
        type: Boolean
      }
    };
  }

  constructor() {
    super();

    const now = new Date();

    this.showtime = false;
    this.confirmondate = false;
    this.datestyle = 'short';
    this.startyear = now.getFullYear() - 100;
    this.endyear = now.getFullYear() + 5;
    this.startday = 1;

    try {
      const input = document.createElement('input');
      input.type = 'date';
      this._hasNative = input.type === 'date';
    } catch (error) {
      this._hasNative = false;
    }

    this.onClickOutside = this.onClickOutside.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();

    document.addEventListener('click', this.onClickOutside);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    document.removeEventListener('click', this.onClickOutside);
  }

  firstRender(_) {
    _.innerHTML = `
      <style>
        :host {
          position: relative;
          display: contents;

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

        :host(.has-native) slot {
          display: none;
        }

        :host(.has-native) slot:not([name]) {
          display: contents;
        }

        aeon-calendar {
          position: absolute;
        }

        @media (max-width: 640px) {
          aeon-calendar {
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
        this.date = this._dateInput.value;
      }

      this._timeInput = elements.find(el => el.getAttribute('type') === 'time');

      if (this._timeInput) {
        this.showtime = true;
        this.time = this._timeInput.value;
      }
    });

    this._output = document.createElement('input');
    this._output.slot = 'output';
    this._output.readOnly = true;
    this._output.addEventListener('click', () => {
      this.$.calendar.open = true;
    });
    this.appendChild(this._output);

    this.addEventListener('keyup', event => {
      switch (event.key) {
        case ' ':
          if (!this.$.calendar.open) {
            this.$.calendar.open = true;
          }
          break;
      }
    });

    this.$.calendar.addEventListener('change', event => {
      this.date = event.target.value.date;
      this.time = event.target.value.time;
      this.$.calendar.open = false;
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
      'startyear' in triggers ||
      'endyear' in triggers ||
      'startday' in triggers ||
      'showtime' in triggers ||
      'confirmondate' in triggers
    ) {
      this.updateFromString(this.date, this.time);
    }
  }

  update(date = null) {
    const validDate = date && !isNaN(date);
    let showDate = date;

    if (!validDate) {
      const date = this.defaultdate;
      const time = this.defaulttime;
      showDate = this.parseDate(date, time);
    }

    const cal = this.$.calendar;
    cal.year = showDate.getFullYear();
    cal.month = showDate.getMonth();
    cal.day = showDate.getDate();
    cal.hours = showDate.getHours();
    cal.minutes = showDate.getMinutes();
    cal.locale = this.locale;
    cal.startyear = this.startyear;
    cal.endyear = this.endyear;
    cal.startday = this.startday;
    cal.showtime = this.showtime;
    cal.confirmondate = this.confirmondate;

    if (validDate) {
      const dateString = new Intl.DateTimeFormat(this.locale, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        ...(this.showtime
          ? {
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric'
            }
          : {}),
        ...this._datestyle
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

  parseDate(date, time = '00:00') {
    try {
      const dateParts = date.split('-');
      const timeParts = time.split(':');

      return new Date(
        dateParts[0],
        dateParts[1] - 1,
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

  onClickOutside(event) {
    if (this.$.calendar.open) {
      const outsideComponent = !event
        .composedPath()
        .some(element => element === this);

      if (outsideComponent) {
        this.$.calendar.open = false;
        this._dontFocus = true;
      }
    }
  }
}

export default DatePicker;
