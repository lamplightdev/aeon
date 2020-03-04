import {
  boolean,
  color,
  select,
  withKnobs,
  text,
  object
} from '@storybook/addon-knobs';

import './styles.css';
import '../../dist/aeon.js';

export default { title: 'Aeon', decorators: [withKnobs] };

const startDays = {
  'Sunday (0)': 0,
  'Monday (1)': 1,
  'Tuesday (2)': 2,
  'Wednesday (3)': 3,
  'Thursday (4)': 4,
  'Friday (5)': 5,
  'Saturday (6)': 6
};

const getRGB = value => {
  return value
    .replace(/[^0-9,]/g, '')
    .split(',')
    .slice(0, 3)
    .join(',');
};

export const dateOnly = () => {
  const knobs = {
    initialDate: text('Initial date', '2020-01-02'),
    defaultDate: text('Default date', '2020-01-01'),
    startDay: select('Start day', startDays, 1),
    startYear: text('Start year', '1900'),
    endYear: text('End year', '2050'),
    locale: text('Locale', ''),
    dateStyle: object('Date style', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    }),
    confirmOnDate: boolean('Confirm on date', false),
    useNative: boolean('Use native', false),
    fgColor: color('Foreground Color', 'rgb(0, 0, 0)'),
    bgColor: color('Background Color', 'rgb(248, 248, 248)')
  };

  const container = document.createElement('div');
  container.innerHTML = `
    <aeon-datepicker
      default-date="${knobs.defaultDate}"
      start-day="${knobs.startDay}"
      start-year="${knobs.startYear}"
      end-year="${knobs.endYear}"
      locale="${knobs.locale}"
      date-style="${JSON.stringify(knobs.dateStyle)}"
      ${knobs.confirmOnDate ? `confirm-on-date` : ''}
      ${knobs.useNative ? `use-native` : ''}
      style="--aeon-rgb: ${getRGB(knobs.fgColor)}; --aeon-bgRgb: ${getRGB(
    knobs.bgColor
  )};"
    >
      <input
        type="date"
        id="date"
        value="${knobs.initialDate}"
        placeholder="Start date"
      />
    </aeon-datepicker>
  `;

  return container.firstElementChild;
};

export const dateAndTime = () => {
  const knobs = {
    initialDate: text('Initial date', '2020-01-02'),
    initialTime: text('Initial time', '12:00'),
    defaultDate: text('Default date', '2020-01-01'),
    defaultTime: text('Default time', '19:30'),
    startDay: select('Start day', startDays, 1),
    startYear: text('Start year', '1900'),
    endYear: text('End year', '2050'),
    locale: text('Locale', ''),
    dateStyle: object('Date style', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hours: 'numeric',
      minutes: 'numeric'
    }),
    useNative: boolean('Use native', false),
    fgColor: color('Foreground Color', 'rgb(0, 0, 0)'),
    bgColor: color('Background Color', 'rgb(248, 248, 248)')
  };

  const container = document.createElement('div');
  container.innerHTML = `
    <aeon-datepicker
      default-date="${knobs.defaultDate}"
      default-time="${knobs.defaultTime}"
      start-day="${knobs.startDay}"
      start-year="${knobs.startYear}"
      end-year="${knobs.endYear}"
      locale="${knobs.locale}"
      date-style="${JSON.stringify(knobs.dateStyle)}"
      ${knobs.useNative ? `use-native` : ''}
      style="--aeon-rgb: ${getRGB(knobs.fgColor)}; --aeon-bgRgb: ${getRGB(
    knobs.bgColor
  )};"
    >
      <input
        type="date"
        id="date"
        value="${knobs.initialDate}"
        placeholder="Date"
      />
      <input
        type="time"
        id="time"
        value="${knobs.initialTime}"
        placeholder="Time"
      />
    </aeon-datepicker>
  `;

  return container.firstElementChild;
};
