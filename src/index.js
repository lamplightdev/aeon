class DatePicker extends HTMLElement {
  static get observedAttributes() {
    return [
      'locale',
      'date-style',
      'start-year',
      'end-year',
      'start-day',
      'default-date'
    ];
  }

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.$ = this.shadowRoot.querySelector.bind(this.shadowRoot);

    this.onClickOutside = this.onClickOutside.bind(this);
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
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

        .week {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        select {
          -webkit-appearance: none;
          -moz-appearance: none;
          padding: 0.5rem;
          padding-right: 1.5rem;
          font-size: 0.8rem;
          border-radius: 0;
          border-color: var(--hintColor);
          background-color: transparent;
          color: var(--color);
          width: 100%;
        }

        .select {
          width: 50%;
          position: relative;
        }

        .select + .select {
          margin-left: 1rem;
        }

        .select .indicator {
          position: absolute;
          top: 0;
          bottom: 0;
          right: 0.2rem;
          pointer-events: none;
          display: flex;
          align-items: center;
        }

        .day, .date, button {
          color: var(--color);
          background-color: transparent;
          border: 0;
          box-sizing: border-box;
          width: 2.4rem;
          height: 2.4rem;
          padding: 0;
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

        #container {
          position: absolute;

          display: none;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          padding: 0.2rem;
          background-color: var(--bgColor);
        }

        #inner {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        #buttons {
          width: 100%;
          display: flex;
          justify-content: space-between;
        }

        @media (max-width: 640px) {
          #container {
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
          }
        }

        #container.show {
          display: flex;
        }

        #year-month {
          display: flex;
          width: 100%;
        }
      </style>
      <slot></slot>

      <slot name="output"></slot>

      <div id="container">
        <div id="inner">
          <div id="buttons">
            <button id="cancel" title="Cancel">
              <svg width="24" height="24">
                <g><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></g>
              </svg>
            </button>
            <button id="clear" title='Clear'>
              <svg width="24" height="24">
                <g><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></g>
              </svg>
            </button>
          </div>
          <div id="year-month"></div>
          <div id="calendar"></div>
        </div>
      </div>
    `;

    this.addEventListener('keyup', event => {
      switch (event.key) {
        case 'Escape':
          this.hideCalendar(true);
          this.focus();
          break;
        case ' ':
          event.preventDefault();
          this.toggleCalendar();
          break;
      }
    });

    this.addEventListener('keydown', this.onKeyDown.bind(this));

    this.$('#calendar').addEventListener('click', this.onDateClick.bind(this));
    this.$('#cancel').addEventListener('click', () => {
      this.hideCalendar(true);
    });
    this.$('#clear').addEventListener('click', () => {
      this.update();
      this.hideCalendar(true);
    });

    const slot = this.$('slot');
    slot.addEventListener('slotchange', event => {
      this._dateInput = slot.assignedElements()[0];
      if (this._dateInput) {
        this._dateInput.addEventListener(
          'change',
          this.onInputChange.bind(this)
        );
        this._dateOutput.placeholder = this._dateInput.placeholder;
      }
      this.updateFromString(
        this._dateInput ? this._dateInput.value : undefined
      );
    });

    this._dateOutput = document.createElement('input');
    this._dateOutput.slot = 'output';
    this._dateOutput.readOnly = true;
    this._dateOutput.placeholder = this.getAttribute('placeholder') || '';
    this._dateOutput.addEventListener('click', event => {
      this.showCalendar();
    });

    this.appendChild(this._dateOutput);

    this.init();
    this.update();
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.onClickOutside);
  }

  attributeChangedCallback() {
    this.init();
    this.updateFromString(this._dateInput ? this._dateInput.value : undefined);
  }

  init() {
    this._locale = this.getAttribute('locale') || undefined;
    this._dateStyle = this.getAttribute('date-style') || 'short';

    let now = new Date();

    const startYear =
      this.getAttribute('start-year') || now.getFullYear() - 100;
    const endYear = this.getAttribute('end-year') || now.getFullYear() + 5;
    this._years = [];
    for (let i = startYear; i <= endYear; i++) {
      this._years.push(i);
    }

    now.setDate(1);
    this._days = [];
    for (let i = 0; i < 7; i++) {
      let dayNum = now.getDay();
      this._days.push({
        num: dayNum,
        name: now.toLocaleString(this._locale, { weekday: 'short' })
      });
      now.setDate(i + 2);
    }
    const startDay = this.getAttribute('start-day');
    const startDayOffset = startDay ? 7 - startDay : 6;
    this._days.sort(
      (a, b) => ((a.num + startDayOffset) % 7) - ((b.num + startDayOffset) % 7)
    );

    now = new Date();
    now.setMonth(0, 1);
    this._months = [];
    for (let i = 0; i < 12; i++) {
      let monthNum = now.getMonth();
      this._months.push({
        num: monthNum,
        name: now.toLocaleString(this._locale, { month: 'short' })
      });
      now.setMonth(i + 1);
    }
    this._months.sort((a, b) => a.num - b.num);

    this.$('#year-month').innerHTML = `
      <div class="select">
        <select id="year">
          ${this._years
            .map(year => `<option value="${year}">${year}</option>`)
            .join('')}
        </select>
        <span class="indicator">
          <svg width="24" height="24">
            <g><path fill="currentColor" d="M7 10l5 5 5-5z"></path></g>
          </svg>
        </span>
      </div>
      <div class="select">
        <select id="month">
          ${this._months
            .map(month => `<option value="${month.num}">${month.name}</option>`)
            .join('')}
        </select>
        <span class="indicator">
          <svg width="24" height="24">
            <g><path fill="currentColor" d="M7 10l5 5 5-5z"></path></g>
          </svg>
        </span>
      </div>
    `;

    this.$('#year').addEventListener('change', this.onYearChange.bind(this));
    this.$('#month').addEventListener('change', this.onMonthChange.bind(this));
  }

  formatAsDate(year, month, day) {
    return `${year}-${`${month + 1}`.padStart(2, '0')}-${`${day}`.padStart(
      2,
      '0'
    )}`;
  }

  onDateClick(event) {
    if (event.target.classList.contains('date')) {
      const button = event.target;
      const day = parseInt(button.dataset.day, 10);
      this.update(new Date(this.formatAsDate(this._year, this._month, day)));
      this.hideCalendar(true);
    }
  }

  onInputChange(event) {
    this.updateFromString(event.target.value);
  }

  onYearChange(event) {
    const year = parseInt(event.target.value, 10);
    this.updateFromString(this.formatAsDate(year, this._month, this._day));
  }

  onMonthChange(event) {
    const month = parseInt(event.target.value, 10);
    this.updateFromString(this.formatAsDate(this._year, month, this._day));
  }

  onClickOutside(event) {
    const outsideComponent = !event
      .composedPath()
      .some(element => element === this);

    if (outsideComponent) {
      this.hideCalendar();
    }
  }

  onKeyDown(event) {
    const isTabPressed = event.key === 'Tab';

    if (!isTabPressed) {
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

  showCalendar() {
    if (!this.$('#container').classList.contains('show')) {
      this.$('#container').classList.add('show');
      this.$('.today').focus();
      document.addEventListener('click', this.onClickOutside);
    }
  }

  hideCalendar(focus = false) {
    if (this.$('#container').classList.contains('show')) {
      this.$('#container').classList.remove('show');

      if (focus) {
        this._dateOutput.focus();
      }

      document.removeEventListener('click', this.onClickOutside);
    }
  }

  toggleCalendar(focus = true) {
    if (this.$('#container').classList.contains('show')) {
      this.hideCalendar(focus);
    } else {
      this.showCalendar();
    }
  }

  updateFromString(value) {
    this.update(new Date(value));
  }

  update(date = null) {
    const validDate = date && !isNaN(date);
    let showDate = date;

    if (!validDate) {
      const defaultDate = this.getAttribute('default-date');
      showDate = defaultDate ? new Date(defaultDate) : new Date();
    }

    this._year = showDate.getFullYear();
    this._month = showDate.getMonth();
    this._day = showDate.getDate();

    this.$('#year').value = this._year;
    this.$('#month').value = this._month;

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

    this.dispatchEvent(
      new Event('change', {
        bubbles: true
      })
    );

    this.render();
  }

  set value(val) {
    this.updateFromString(val);
  }

  get value() {
    return this.formatAsDate(this._year, this._month, this._day);
  }

  //locale", "date-style", "start-year", "end-year", "start-day
  set locale(val) {
    this.setAttribute('locale', val);
  }
  get locale() {
    return this.getAttribute('locale');
  }

  set dateStyle(val) {
    this.setAttribute('date-style', val);
  }
  get dateStyle() {
    return this.getAttribute('date-style');
  }

  set startYear(val) {
    this.setAttribute('start-year', val);
  }
  get startYear() {
    return this.getAttribute('start-year');
  }

  set endYear(val) {
    this.setAttribute('end-year', val);
  }
  get endYear() {
    return this.getAttribute('end-year');
  }

  set startDay(val) {
    this.setAttribute('start-day', val);
  }
  get startDay() {
    return this.getAttribute('start-day');
  }

  set defaultDate(val) {
    this.setAttribute('default-date', val);
  }
  get defaultDate() {
    return this.getAttribute('default-date');
  }

  render() {
    let workingDate = new Date(this._year, this._month, 1, 12);
    const monthStartDay = workingDate.getDay();

    workingDate.setMonth(workingDate.getMonth() + 1);
    workingDate.setDate(0);
    const daysInMonth = workingDate.getDate();

    workingDate = new Date(this._year, this._month, 1, 12);

    let started = false;
    let finished = false;
    let count = 0;

    this.$('#calendar').innerHTML = `
      <div class="week">
        ${this._days.map(day => `<div class="day">${day.name}</div>`).join('')}
      </div>

      ${[...Array(6).keys()]
        .map(() => {
          if (count > daysInMonth) return null;

          return `
          <div class="week">
            ${this._days
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

                const isToday = count === this._day;

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

    const focusableEls = this.shadowRoot.querySelectorAll(
      'button:not([disabled]), select'
    );
    this._firstFocusableEl = focusableEls[0];
    this._lastFocusableEl = focusableEls[focusableEls.length - 1];
  }
}

export default DatePicker;
