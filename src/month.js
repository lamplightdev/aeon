import AeonElement from './aeon.js';

class Month extends AeonElement {
  static get props() {
    return {
      value: {
        type: Number
      },
      months: {
        type: Array
      }
    };
  }

  constructor() {
    super();

    this.months = [];
  }

  firstRender(_) {
    _.innerHTML = `
      <style>
        select {
          -webkit-appearance: none;
          -moz-appearance: none;
          padding: 0.5rem;
          padding-right: 1.5rem;
          font-family: inherit;
          font-size: 0.8rem;
          border-radius: 0;
          border-color: var(--hintColor);
          background-color: transparent;
          color: var(--color);
          width: 100%;
        }

        .select {
          position: relative;
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
      </style>

      <div class="select">
        <select id="month">
        </select>
        <span class="indicator">
          <svg width="24" height="24">
            <g><path fill="currentColor" d="M7 10l5 5 5-5z"></path></g>
          </svg>
        </span>
      </div>
    `;
  }

  firstRendered() {
    this.$.month.addEventListener('change', event => {
      this.value = event.target.value;
    });
  }

  render(_, triggers) {
    if ('value' in triggers) {
      this.dispatchEvent(
        new Event('change', {
          bubbles: true
        })
      );
    }

    this.$.month.innerHTML = this.months
      .map(month => `<option value="${month.num}">${month.name}</option>`)
      .join('');

    this.$.month.value = this.value;
  }
}

export default Month;
