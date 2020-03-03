# Aeon

> A lightweight date picker built with web components that can be used anywhere

- **No dependencies** - a standalone vanilla JS web component
- **Lightweight** - 5kb gzipped
- **Locale aware** - uses the browser locale language and date format by default
- **Themeable** - pass in custom colour schemes
- **Browser support** - works in all modern browsers and IE11 (with polyfills)

## Table of Contents

- [Examples](#examples)
- [Motivation](#motivation)
- [Install](#install)
- [Usage](#usage)
- [Options](#options)
- [Events](#events)
- [License](#license)

## Examples

- [A basic example](https://lamplightdev.github.io/aeon/)
- [Same example with IE11 support](https://lamplightdev.github.io/aeon/es5)
- [Storybook](https://lamplightdev.github.io/aeon/storybook/static/?path=/story/*) - play with all the options

## Motivation

## Install

Install using [npm](https://npmjs.com):

```sh
npm install --save @lamplightdev/aeon
```

## Usage

If you're using ESM modules - just import Aeon directly into your code:

```
// if you're using a bundler that resolves node_modules
import '@lamplightdev/aeon';

// if you're using a bundler that doesn't resove node_modules
import 'path/to/node_modules/@lamplightdev/aeon/src/aeon.js';
```

Alternatively include Aeon in a script tag:

```
<script type="module" src="https://unpkg.com/@lamplightdev/aeon@0.0.3/dist/aeon.js">

<!-- or for the ES5 version -->

<script src="https://unpkg.com/@lamplightdev/aeon@0.0.3/dist/aeon-es5.js">
```

Then use the `<aeon-datepicker>` tag in your HTML wrapping a date input and optionally a time input:

```
<aeon-datepicker>
  <input type="date">
</aeon-datepicker>

<aeon-datepicker>
  <input type="date">
  <input type="time">
</aeon-datepicker>
```

All Aeon options can be set declaratively as attributes on the `<aeon-datepicker>` tag, or set imperatively in code:

```
<label for="date-start">Start Date</label>

<aeon-datepicker
  id="datepicker"
  locale="en-us"
  default-date="2020-01-01"
  default-time="09:30"
>
  <input
    id="date-start"
    name="date-start"
    type="date"
    value="2020-04-06"
    placeholder="Start date"
  />
  <input
    id="time-start"
    name="time-start"
    type="time"
    value="12:00"
  />
</aeon-datepicker>

<script>
  document.querySelector('#datepicker').locale = 'es';
</script>
```

On setting a date and time with Aeon the wrapped inputs will be set to the new values, so Aeon can wrap any existing date/time input with no other changes to existing code.

## Options

## Events

## License

[MIT License](https://oss.ninja/mit/lamplightdev) © [Chris Haynes](https://lamplightdev.com)
