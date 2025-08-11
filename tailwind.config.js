/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
    theme: { extend: { fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] } } },
    plugins: [],
  };
  