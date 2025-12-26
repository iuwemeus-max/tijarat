import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f8ff",
          100: "#e6edff",
          200: "#cddaff",
          300: "#a6bbff",
          400: "#8093ff",
          500: "#5568e8",
          600: "#3b4cc4",
          700: "#2d3b9a",
          800: "#24307c",
          900: "#1f2b66"
        }
      },
      boxShadow: {
        card: "0 10px 30px rgba(15, 23, 42, 0.08)",
      }
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

export default config;
