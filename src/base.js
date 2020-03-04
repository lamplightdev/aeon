class BaseElement extends HTMLElement {
  static get props() {
    return {};
  }

  static get observedAttributes() {
    return Object.keys(this.props)
      .filter(propName => {
        return !this.props[propName].noReflect;
      })
      .map(propName => {
        return this.attributeName(propName);
      });
  }

  static attributeName(propName) {
    return propName.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
  }

  constructor(useShadow = true, options = {}) {
    super();

    this._ = this;
    this.$ = {};

    this.attrToProp = {};
    this.propToAttr = {};
    Object.keys(this.constructor.props).forEach(name => {
      const attrName = this.constructor.attributeName(name);
      this.attrToProp[attrName] = name;
      this.propToAttr[name] = attrName;
    });

    if (useShadow) {
      this.attachShadow({ mode: 'open', ...options });
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
        const attrName = this.propToAttr[propName];

        const initialValue = this.hasAttribute(attrName)
          ? this.getAttribute(attrName)
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

    this._renderPromise = Promise.resolve().then(() => {
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
    const attrName = this.propToAttr[propName];

    return value => {
      if (this._props[propName] === value) return;

      if (!(propName in this._triggers)) {
        this._triggers[propName] = this._props[propName];
      }

      this._props[propName] = value;

      const propertyInfo = this.constructor.props[propName];

      if (this.constructor.observedAttributes.includes(attrName)) {
        let attributeValue = value;

        if (propertyInfo.type === Boolean) {
          attributeValue = attributeValue || attributeValue === '';
          if (attributeValue) {
            this.setAttribute(attrName, '');
          } else {
            this.removeAttribute(attrName);
          }
        } else {
          if ([Array, Object].includes(propertyInfo.type)) {
            attributeValue = JSON.stringify(attributeValue);
          }

          if (this.getAttribute(attrName) !== attributeValue) {
            if ([null, undefined].includes(attributeValue)) {
              this.removeAttribute(attrName);
            } else {
              this.setAttribute(attrName, attributeValue);
            }
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

  attributeChangedCallback(attrName, oldValue, newValue) {
    const propName = this.attrToProp[attrName];

    const propertyInfo = this.constructor.props[propName];

    let propertyValue = newValue;

    switch (propertyInfo.type) {
      case Boolean:
        propertyValue = propertyValue === '';
        break;
      case Number:
        propertyValue = Number(propertyValue);
        break;
      case Array:
      case Object:
        propertyValue = JSON.parse(propertyValue);
      case String:
        break;
    }

    if (this[propName] !== propertyValue) {
      this[propName] = propertyValue;
    }
  }
}

export default BaseElement;
