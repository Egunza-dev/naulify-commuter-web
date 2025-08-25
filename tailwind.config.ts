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
        // Define our custom color palette here
        'background': '#1A1A1A', // Main dark background
        'card': '#2C2C2C',       // Background for containers, inputs
        'border': '#404040',     // Border color for inputs and cards
        'primary': {
          DEFAULT: '#3B82F6', // The main blue for buttons and links (like Tailwind's blue-500)
          'hover': '#2563EB', // A darker shade for hover states
        },
        'success': {
          DEFAULT: '#16A34A', // The main green for success states (like green-600)
          'hover': '#15803D', // A darker shade for hover
        },
        'danger': {
          DEFAULT: '#DC2626', // The main red for error states (like red-600)
        },
        'text-primary': '#F0F0F0',   // Main text color (off-white)
        'text-secondary': '#A0A0A0', // Secondary text color (gray)
      },
      borderRadius: {
        'lg': '0.75rem', // A slightly larger border radius for a modern feel
      },
    },
  },
  plugins: [],
};
export default config;
