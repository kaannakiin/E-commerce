import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
        primary: {
          50: "#ebf9ff", // 0
          100: "#d6f0fb", // 1
          200: "#a8e1f8", // 2
          300: "#79d1f7", // 3
          400: "#5ac4f5", // 4
          500: "#4bbbf5", // 5
          600: "#41b8f6", // 6
          700: "#35a1dc", // 7
          800: "#278fc5", // 8
          900: "#007cad", // 9
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
  plugins: [],
};
export default config;
