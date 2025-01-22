/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{svelte,js,ts}',  // Path ของไฟล์ที่ใช้ Tailwind
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
};
