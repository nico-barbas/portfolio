/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#141b25",
        darkBrown: "#1a191d",
        azure: "#66D9ED",
        mint: "#8EC07C",
      },
      fontFamily: {
        display: ["Roboto Mono"],
      },
    },
  },
  plugins: [],
};
