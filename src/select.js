import AeonElement from './aeon.js';

class Select extends AeonElement {
  static get props() {
    return {
      value: {
        type: Number
      },
      items: {
        type: Array
      }
    };
  }

  constructor() {
    super(true, {
      // delegatesFocus: true
    });

    this.items = [];
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
          border: 1px solid var(--hintColor);
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
        <select id="select">
        </select>
        <span class="indicator">
          <svg width="24" height="24">
            <g><path fill="currentColor" d="M7 10l5 5 5-5z"></path></g>
          </svg>
        </span>
      </div>
    `;
  }

  // simulate focus event which doesn't exist as `this` doesn't have (not do
  // we want it to have) a tabIndex
  focus() {
    this.$.select.focus();
  }

  firstRendered(_) {
    this.$.select.addEventListener('change', event => {
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

    this.$.select.innerHTML = this.items
      .map(item => `<option value="${item.value}">${item.name}</option>`)
      .join('');

    this.$.select.value = this.value;
  }
}

export default Select;
