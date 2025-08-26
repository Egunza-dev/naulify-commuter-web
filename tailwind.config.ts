import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'background': '#1A1A1A',
        'card': '#2C2C2C',
        'border': '#404040',
        'primary': {
          DEFAULT: '#3B82F6',
          'hover': '#2563EB',
        },
        'success': {
          DEFAULT: '#16A34A',
          'hover': '#15803D',
        },
        'danger': {
          DEFAULT: '#DC2626',
        },
        'text-primary': '#F0F0F0',
        'text-secondary': '#A0A0A0',
      },
      borderRadius: {
        'lg': '0.75rem',
      },
    },
  },
  plugins: [],
};
export default config;
