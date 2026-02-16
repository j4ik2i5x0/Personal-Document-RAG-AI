/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}", "./src/app/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        night: "#0b0e12",
        slate: "#121824",
        mist: "#d9d9d9",
        neon: "#25e2c1",
        ember: "#f6b26b",
      },
      fontFamily: {
        display: ["Space Grotesk", "IBM Plex Sans", "system-ui", "sans-serif"],
        body: ["IBM Plex Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
