import AeonElement from './aeon.js';

class DatePicker extends AeonElement {
  static get props() {
    return {
      value: {
        type: String
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
      usenative: {
        type: Boolean
      }
    };
  }

  constructor() {
    super();

    const now = new Date();

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
      this._dateInput = slot.assignedNodes().find(el => el.tagName);
      if (this._dateInput) {
        this._dateInput.addEventListener(
          'change',
          this.onInputChange.bind(this)
        );
        this._dateOutput.placeholder = this._dateInput.placeholder;
        this.value = this._dateInput.value;
      }
    });

    this._dateOutput = document.createElement('input');
    this._dateOutput.slot = 'output';
    this._dateOutput.readOnly = true;
    this._dateOutput.placeholder = this.getAttribute('placeholder') || '';
    this._dateOutput.addEventListener('click', () => {
      this.$.calendar.open = true;
    });
    this.appendChild(this._dateOutput);

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
      this.value = event.target.value;
      this.$.calendar.open = false;
    });

    this.$.calendar.addEventListener('clear', event => {
      this.value = '';
    });

    this.$.calendar.addEventListener('close', event => {
      if (!this._dontFocus) {
        this._dateOutput.focus();
      }

      this._dontFocus = false;
    });
  }

  render(_, triggers) {
    if ('value' in triggers) {
      this.updateFromString(this.value);

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
      'startday' in triggers
    ) {
      this.updateFromString(this.value);
    }
  }

  update(date = null) {
    const validDate = date && !isNaN(date);
    let showDate = date;

    if (!validDate) {
      const defaultdate = this.getAttribute('defaultdate');
      showDate = defaultdate ? new Date(defaultdate) : new Date();
    }

    const cal = this.$.calendar;
    cal.year = showDate.getFullYear();
    cal.month = showDate.getMonth();
    cal.day = showDate.getDate();
    cal.locale = this.locale;
    cal.startyear = this.startyear;
    cal.endyear = this.endyear;
    cal.startday = this.startday;

    if (validDate) {
      const dateString = new Intl.DateTimeFormat(this._locale, {
        datestyle: this._datestyle
      }).format(date);

      this._dateOutput.value = dateString;
      if (this._dateInput) {
        this._dateInput.value = this.value;
      }
    } else {
      this._dateOutput.value = '';
      if (this._dateInput) {
        this._dateInput.value = '';
      }
    }
  }

  updateFromString(value) {
    this.update(new Date(value));
  }

  onInputChange(event) {
    this.value = event.target.value;
  }

  onClickOutside(event) {
    const outsideComponent = !event
      .composedPath()
      .some(element => element === this);

    if (outsideComponent) {
      this.$.calendar.open = false;
      this._dontFocus = true;
    }
  }
}

export default DatePicker;
