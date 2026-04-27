/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono:    ["'Fira Code'", "monospace"],
        display: ["'Syne'", "sans-serif"],
      },
      colors: {
        bg:       "#080c10",
        surface:  "#0d1117",
        surface2: "#131920",
        border:   "#1c2730",
        border2:  "#243040",
        accent:   "#00e5a0",
        accent2:  "#00b880",
        muted:    "#3a4a5a",
        text:     "#d4dde8",
        textDim:  "#6a7f94",
        textFaint:"#3a4f62",
        danger:   "#ff4d6a",
      },
      boxShadow: {
        glow: "0 0 20px rgba(0,229,160,0.15)",
        card: "0 4px 24px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};
