import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        wave: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        'wave-flow-1': {
          '0%': { transform: 'translateX(-100%) translateY(0) scale(1)' },
          '50%': { transform: 'translateX(50%) translateY(-20px) scale(1.1)' },
          '100%': { transform: 'translateX(200%) translateY(0) scale(1)' },
        },
        'wave-flow-2': {
          '0%': { transform: 'translateX(-120%) translateY(10px) scale(0.9)' },
          '50%': { transform: 'translateX(40%) translateY(-10px) scale(1.2)' },
          '100%': { transform: 'translateX(180%) translateY(10px) scale(0.9)' },
        },
        'wave-flow-3': {
          '0%': { transform: 'translateX(-80%) translateY(-10px) scale(1.1)' },
          '50%': { transform: 'translateX(60%) translateY(15px) scale(0.95)' },
          '100%': { transform: 'translateX(220%) translateY(-10px) scale(1.1)' },
        },
      },
      animation: {
        wave: 'wave 25s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite',
        blob: 'blob 7s infinite',
        'wave-flow-1': 'wave-flow-1 15s linear infinite',
        'wave-flow-2': 'wave-flow-2 18s linear infinite',
        'wave-flow-3': 'wave-flow-3 12s linear infinite',
      },
    },
  },
  plugins: [],
};
export default config;
