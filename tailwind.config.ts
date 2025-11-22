import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'vault-white': '#FFFFFF',
        'vault-bg': '#F8F9FA',
        'vault-card': '#FFFFFF',
        'vault-border': '#003D82',
        'vault-text': '#1A1A1A',
        'vault-navy': '#001F3F',
        'vault-navy-light': '#003D82',
        'vault-navy-hover': '#005BB5',
      },
    },
  },
  plugins: [],
}
export default config
