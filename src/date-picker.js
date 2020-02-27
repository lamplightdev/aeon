import AeonElement from './aeon.js';

class DatePicker extends AeonElement {
  static get props() {
    return {
      value: {},
      locale: {},
      dateStyle: {},
      startYear: {},
      endYear: {},
      startDay: {},
      defaultDate: {},
      useNative: {}
    };
  }

  constructor() {
    super();

    const now = new Date();

    this.dateStyle = 'short';
    this.startYear = now.getFullYear() - 100;
    this.endYear = now.getFullYear() + 5;
    this.startDay = 1;

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

    this.$.calendar.addEventListener('change', event => {
      this.updateFromString(event.target.value);
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
  }

  update(date = null) {
    const validDate = date && !isNaN(date);
    let showDate = date;

    if (!validDate) {
      const defaultDate = this.getAttribute('default-date');
      showDate = defaultDate ? new Date(defaultDate) : new Date();
    }

    const cal = this.$.calendar;
    cal.year = showDate.getFullYear();
    cal.month = showDate.getMonth();
    cal.day = showDate.getDate();

    if (validDate) {
      const dateString = new Intl.DateTimeFormat(this._locale, {
        dateStyle: this._dateStyle
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
    this.updateFromString(event.target.value);
  }

  onClickOutside(event) {
    const outsideComponent = !event
      .composedPath()
      .some(element => element === this);

    if (outsideComponent) {
      this.$.calendar.open = false;
    }
  }
}

export default DatePicker;
