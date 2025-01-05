import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
        primary: {
          50: "#ecf4ff",
          100: "#dce4f5",
          200: "#b9c7e2",
          300: "#94a8d0",
          400: "#748dc0",
          500: "#5f7cb7",
          600: "#5474b4",
          700: "#44639f",
          800: "#3a5890",
          900: "#2c4b80",
        },
        secondary: {
          50: "#fcf9e9", // 0
          100: "#f6f0d9", // 1
          200: "#ebe0b2", // 2
          300: "#dfce88", // 3
          400: "#d6c064", // 4
          500: "#d0b64d", // 5
          600: "#cdb240", // 6
          700: "#b59c31", // 7
          800: "#a18a28", // 8
          900: "#8b771b", // 9
        },
      },
    },
  },
  plugins: [typography],
};
export default config;
