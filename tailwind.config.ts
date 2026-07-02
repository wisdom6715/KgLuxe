import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        cream: "#FAF8F5",
        "warm-gray": "#F5F0EB",
        "dark-brown": "#2C2015",
        "mid-brown": "#7B5B3A",
        "light-tan": "#D4B896",
        "text-muted": "#8C7B6B",
      },
    },
  },
  plugins: [],
};
export default config;
