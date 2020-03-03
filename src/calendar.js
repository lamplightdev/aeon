import BaseElement from './base.js';

class Calendar extends BaseElement {
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
      startYear: {
        type: String
      },
      endYear: {
        type: String
      },
      startDay: {
        type: String
      },
      days: {
        type: Array
      },
      year: {
        type: Number
      },
      month: {
        type: Number
      },
      day: {
        type: Number
      },
      hours: {
        type: Number
      },
      minutes: {
        type: Number
      },
      open: {
        type: Boolean
      }
    };
  }

  constructor() {
    super();

    this.showTime = false;
    this.confirmOnDate = false;
    this.days = [];
    this.open = false;
  }

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  firstRender(_) {
    _.innerHTML = `
      <style>
        :host {
          display: none;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        :host([open]) {
          display: flex;
        }

        #container {
          position: relative;
          z-index: 1;
          padding: 0.2rem;
          background-color: var(--bgColor);
        }

        .week {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .day, .date, button {
          color: var(--color);
          background-color: transparent;
          border: 0;
          box-sizing: border-box;
          width: 2.4rem;
          height: 2.4rem;
          padding: 0;
          font-family: inherit;
          font-size: calc(2.4rem / 3);

          text-transform: uppercase;

          flex-grow: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .date {
          border: 1px solid var(--hintColor);
          border-width: 0 0 1px 1px;
        }

        .date:last-child {
          border-right-width: 1px;
        }

        .date.last + .spacer {
          border-left-width: 1px;
        }

        .week:nth-child(2) .date:not(.spacer) {
          border-top-width: 1px;
        }

        .week:last-child .spacer {
          border-right-width: 0;
          border-bottom-width: 0;
        }

        .date.today {
          font-weight: bold;
        }

        .date:hover, .date.today {
          font-size: 1.3rem;
        }

        .date.spacer {
          border-left-width: 0;
          pointer-events: none;
        }

        #buttons {
          width: 100%;
          display: flex;
          justify-content: space-between;
          margin-top: 0.5em;
          border-top: 1px solid var(--hintColor);
        }

        #year-month, #hours-minutes {
          display: flex;
          width: 100%;
        }

        #year-month aeon-select {
          width: 50%;
        }

        #year-month aeon-select + aeon-select {
          margin-left: 0.5rem;
        }

        #hours-minutes {
          padding-top: 0.5em;
          margin-top: 0.5em;
          border-top: 1px solid var(--hintColor);
          display: none;
          justify-content: center;
          align-items: center;
        }

        #hours-minutes aeon-select {
          width: 3.5rem;
        }

        #hours-minutes aeon-select#hours {
          margin-right: 0.2em;
        }

        #hours-minutes aeon-select#minutes {
          margin-left: 0.2em;
        }

        :host([show-time]) #hours-minutes {
          display: flex;
        }
      </style>

      <div id="container">
        <div id="year-month">
          <aeon-select id="year"></aeon-select>
          <aeon-select id="month"></aeon-select>
        </div>
        <div id="calendar"></div>
        <div id="hours-minutes">
          <aeon-select id="hours"></aeon-select>:<aeon-select id="minutes"></aeon-select>
        </div>
        <div id="buttons">
          <button id="confirm" title="Confirm">
            <svg width="24" height="24">
              <g><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></g>
            </svg>
          </button>
          <button id="cancel" title="Cancel">
            <svg width="24" height="24">
              <g><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></g>
            </svg>
          </button>
          <button id="clear" title='Clear'>
            <svg width="24" height="24">
              <g><path fill="currentColor" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"></path></g>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  firstRendered(_) {
    this.addEventListener('keyup', event => {
      switch (event.key) {
        case 'Escape':
          this.open = false;
          break;
      }
    });

    this.$.year.addEventListener('change', event => {
      this.year = event.target.value;
    });

    this.$.month.addEventListener('change', event => {
      this.month = event.target.value;
    });

    this.$.hours.items = [...Array(24).keys()].map((dummy, i) => ({
      name: `${i}`.padStart(2, '0'),
      value: i
    }));

    this.$.hours.addEventListener('change', event => {
      this.hours = event.target.value;
    });

    this.$.minutes.items = [...Array(60).keys()].map((dummy, i) => ({
      name: `${i}`.padStart(2, '0'),
      value: i
    }));

    this.$.minutes.addEventListener('change', event => {
      this.minutes = event.target.value;
    });

    this.$.calendar.addEventListener('click', this.onDateClick.bind(this));

    this.$.cancel.addEventListener('click', () => {
      this.open = false;
    });

    this.$.confirm.addEventListener('click', () => {
      this.confirm();
    });

    this.$.clear.addEventListener('click', () => {
      this.dispatchEvent(
        new Event('clear', {
          bubbles: true
        })
      );
      this.open = false;
    });
  }

  render(_, triggers) {
    if ('open' in triggers && this.open === false && triggers.open === true) {
      this.dispatchEvent(
        new Event('close', {
          bubbles: true
        })
      );
    }

    if ('year' in triggers || 'month' in triggers || 'day' in triggers) {
      this.date = this.formatAsDate(this.year, this.month, this.day);
    }

    if ('hours' in triggers || 'minutes' in triggers) {
      this.time = this.formatAsTime(this.hours, this.minutes);
    }

    const now = new Date();
    now.setMonth(0); // not now.setMonth(0, 1) as this can cause issues - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setMonth#Description
    now.setDate(1);

    this.$.year.value = this.year;
    this.$.year.items = [];
    for (let i = this.startYear; i <= this.endYear; i++) {
      this.$.year.items.push({ value: i, name: i });
    }

    this.$.month.value = this.month;
    this.$.month.items = [];
    for (let i = 0; i < 12; i++) {
      let monthNum = now.getMonth();
      this.$.month.items.push({
        value: monthNum,
        name: now.toLocaleString(this.locale || undefined, { month: 'short' })
      });
      now.setMonth(i + 1);
    }
    this.$.month.items.sort((a, b) => a.num - b.num);

    now.setMonth(0);
    now.setDate(1);
    this.days = [];
    for (let i = 0; i < 7; i++) {
      let dayNum = now.getDay();
      this.days.push({
        num: dayNum,
        name: now.toLocaleString(this.locale || undefined, { weekday: 'short' })
      });
      now.setDate(i + 2);
    }
    const startDayOffset = 7 - this.startDay;
    this.days.sort(
      (a, b) => ((a.num + startDayOffset) % 7) - ((b.num + startDayOffset) % 7)
    );

    this.$.hours.value = this.hours;
    this.$.minutes.value = this.minutes;

    ////

    let workingDate = new Date(this.year, this.month, 1, 12);
    const monthStartDay = workingDate.getDay();

    workingDate.setMonth(workingDate.getMonth() + 1);
    workingDate.setDate(0);
    const daysInMonth = workingDate.getDate();

    workingDate = new Date(this.year, this.month, 1, 12);

    let started = false;
    let finished = false;
    let count = 0;

    this.$.calendar.innerHTML = `
      <div class="week">
        ${this.days.map(day => `<div class="day">${day.name}</div>`).join('')}
      </div>

      ${[0, 1, 2, 3, 4, 5]
        .map(() => {
          if (count >= daysInMonth) return null;

          return `
          <div class="week">
            ${this.days
              .map(day => {
                const dayNum = day.num % 7;
                if (dayNum === monthStartDay) {
                  started = true;
                }

                let date = '';
                if (started) {
                  count += 1;
                  if (count <= daysInMonth) {
                    date = count;
                    workingDate.setDate(date);
                  } else {
                    finished = true;
                  }
                }

                const isToday = count === this.day;

                return `
                  <button class="date ${isToday ? 'today' : ''} ${
                  !started || finished ? 'spacer' : ''
                } ${count === daysInMonth ? 'last' : ''}" data-day="${count}" ${
                  !started || finished ? "tabindex='-1' disabled" : ''
                }>${date}</button>
              `;
              })
              .join('')}
          </div>
         `;
        })
        .join('')}
    `;

    const focusableEls = _.querySelectorAll(
      'button:not([disabled]), aeon-select'
    );
    this._firstFocusableEl = focusableEls[0];
    this._lastFocusableEl = focusableEls[focusableEls.length - 1];
  }

  rendered(_, triggers) {
    if (this.open === true) {
      if (
        ('open' in triggers && triggers.open === false) ||
        'day' in triggers
      ) {
        _.querySelector('.today').focus();
      }
    }
  }

  confirm() {
    this.date = this.formatAsDate(this.year, this.month, this.day);
    this.time = this.formatAsTime(this.hours, this.minutes);

    this.value = {
      date: this.date,
      time: this.time
    };

    this.dispatchEvent(
      new Event('change', {
        bubbles: true
      })
    );
  }

  onKeyDown(event) {
    if (event.key !== 'Tab') {
      return;
    }

    const activeElement = this.shadowRoot.activeElement;

    if (event.shiftKey && activeElement === this._firstFocusableEl) {
      this._lastFocusableEl.focus();
      event.preventDefault();
    } else if (!event.shiftKey && activeElement === this._lastFocusableEl) {
      this._firstFocusableEl.focus();
      event.preventDefault();
    }
  }

  onDateClick(event) {
    if (event.target.classList.contains('date')) {
      const button = event.target;
      this.day = parseInt(button.dataset.day, 10);

      if (this.confirmOnDate && !this.showTime) {
        this.confirm();
      }
    }
  }

  formatAsDate(year, month, day) {
    return `${year}-${`${month + 1}`.padStart(2, '0')}-${`${day}`.padStart(
      2,
      '0'
    )}`;
  }

  formatAsTime(hours, minutes) {
    return `${`${hours}`.padStart(2, '0')}:${`${minutes}`.padStart(2, '0')}`;
  }
}

export default Calendar;
