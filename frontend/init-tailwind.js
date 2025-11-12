const fs = require("fs");
const path = require("path");

// tailwind.config.js
const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};`;

// postcss.config.js
const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`;

// src/index.css
const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;`;

// Crear archivos
fs.writeFileSync(path.join(__dirname, "tailwind.config.js"), tailwindConfig);
fs.writeFileSync(path.join(__dirname, "postcss.config.js"), postcssConfig);
if (!fs.existsSync(path.join(__dirname, "src"))) fs.mkdirSync(path.join(__dirname, "src"));
fs.writeFileSync(path.join(__dirname, "src", "index.css"), indexCss);

console.log("✅ TailwindCSS inicializado correctamente.");