class AeonElement extends HTMLElement {
  static get props() {
    return {};
  }

  static get observedAttributes() {
    return Object.keys(this.props).filter(propName => {
      return [Boolean, Number, String].includes(this.props[propName].type);
    });
  }

  constructor(useShadow = true) {
    super();

    this._ = this;
    this.$ = {};

    if (useShadow) {
      this.attachShadow({ mode: 'open' });
      this._ = this.shadowRoot;
    }

    const initialProps = Object.keys(this.constructor.props).reduce(
      (all, propName) => {
        return {
          ...all,
          [propName]: this[propName]
        };
      },
      {}
    );

    Promise.resolve().then(() => {
      this._props = {};

      Object.keys(this.constructor.props).forEach(propName => {
        const initialValue = this.hasAttribute(propName)
          ? this.getAttribute(propName)
          : initialProps[propName] !== undefined
          ? initialProps[propName]
          : this[propName];

        Object.defineProperty(this, propName, {
          set: this.setter(propName),
          get: this.getter(propName)
        });

        this[propName] = initialValue;
      });
    });

    this._renderPromise = null;
    this._isConnected = false;

    this._triggers = {};
  }

  connectedCallback() {
    this._isConnected = true;

    this._render(true, true);
  }

  disconnectedCallback() {
    this._isConnected = false;
  }

  _requestRender() {
    if (!this._renderPromise) {
      this._renderPromise = Promise.resolve().then(() => {
        this._render();
        // this._renderPromise = null;
        // this._triggers = {};
      });
    }
  }

  _render(force = false, first = false) {
    if (
      !force &&
      (!this.shouldRender(this._triggers) ||
        !Object.keys(this._triggers).length)
    ) {
      return;
    }

    if (first) {
      this.firstRender(this._, this._triggers);

      this.$ = [...this._.querySelectorAll('[id]')].reduce((all, el) => {
        return {
          ...all,
          [el.id]: el
        };
      }, {});

      this.firstRendered(this._, this._triggers);
    }

    this._renderPromise = Promise.resolve().then(() => {
      this.render(this._, this._triggers);
      this.rendered(this._, this._triggers);

      this._renderPromise = null;
      this._triggers = {};
    });
  }

  forceRender() {
    this._render(true);
  }

  shouldRender() {
    return true;
  }

  firstRender() {}

  render() {}

  firstRendered() {}

  rendered() {}

  setter(propName) {
    return value => {
      if (this._props[propName] === value) return;

      if (!(propName in this._triggers)) {
        this._triggers[propName] = this._props[propName];
      }

      this._props[propName] = value;

      const propertyInfo = this.constructor.props[propName];

      if (this.constructor.observedAttributes.includes(propName)) {
        let attributeValue = value;

        switch (propertyInfo.type) {
          case Boolean:
            attributeValue = !!attributeValue;
            break;
        }

        if (propertyInfo.type === Boolean) {
          if (attributeValue && !this.hasAttribute(propName)) {
            this.setAttribute(propName, '');
          } else if (!attributeValue) {
            this.removeAttribute(propName);
          }
        } else if (this.getAttribute(propName) !== attributeValue) {
          if ([null, undefined].includes(attributeValue)) {
            this.removeAttribute(propName);
          } else {
            this.setAttribute(propName, attributeValue);
          }
        }
      }

      if (this._isConnected) {
        this._requestRender();
      }
    };
  }

  getter(propName) {
    return () => this._props[propName];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    const propertyInfo = this.constructor.props[name];

    let propertyValue = newValue;

    switch (propertyInfo.type) {
      case Boolean:
        propertyValue = propertyValue === '';
        break;
      case Number:
        propertyValue = Number(propertyValue);
        break;
      case String:
        break;
    }

    if (this[name] !== propertyValue) {
      this[name] = propertyValue;
    }
  }

  emit(eventName, detail = {}, options = { bubbles: true, composed: true }) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        ...options,
        ...detail
      })
    );
  }
}

export default AeonElement;
