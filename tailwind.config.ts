/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 커스텀 색상
        primary: {
          50: "#eef2ff",
          100: "#dfe6ff",
          200: "#c3cfff",
          300: "#a1b0ff",
          400: "#7e8aff",
          500: "#5a5cff",
          600: "#4d45f7",
          700: "#3e33dc",
          800: "#322bb2",
          900: "#2c298c",
          950: "#1c184f",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 10px rgba(0, 0, 0, 0.05)",
        medium: "0 4px 20px rgba(0, 0, 0, 0.1)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
};
