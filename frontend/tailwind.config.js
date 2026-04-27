/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        moss: "#2f5d50",
        pine: "#1f3f35",
        sand: "#f6f1e8",
        ember: "#d97745",
        sky: "#8ecae6",
      },
      fontFamily: {
        display: ["Source Serif 4", "serif"],
        body: ["Public Sans", "sans-serif"],
      },
      boxShadow: {
        panel: "0 20px 60px rgba(15, 23, 42, 0.12)",
      },
      backgroundImage: {
        grid: "radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.08) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};
