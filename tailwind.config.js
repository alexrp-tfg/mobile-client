/** @type {import('tailwindcss').Config} */
import preset from '@lynx-js/tailwind-preset';
module.exports = {
  content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
  presets: [preset],
};
