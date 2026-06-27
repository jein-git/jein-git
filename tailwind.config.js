/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E85D04',
          dark: '#9A3412',
          light: '#FED7AA',
        },
        accent: {
          DEFAULT: '#C92A2A',
          light: '#FEE2E2',
        },
        surface: {
          base: '#FFFBF5',
          card: '#FFFFFF',
          muted: '#FAF0E6',
        },
        ink: {
          DEFAULT: '#1A1A1A',
          muted: '#4A3329',
          subtle: '#7A5C4D',
        },
        line: {
          DEFAULT: '#E5D5C5',
          strong: '#C9B59E',
        },
        success: {
          DEFAULT: '#1B5E20',
          light: '#C8E6C9',
        },
        warn: {
          DEFAULT: '#9A3412',
          light: '#FED7AA',
        },
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        caption: ['15px', { lineHeight: '1.6' }],
        body: ['17px', { lineHeight: '1.7' }],
        'body-lg': ['19px', { lineHeight: '1.7' }],
        h3: ['22px', { lineHeight: '1.6' }],
        h2: ['26px', { lineHeight: '1.5' }],
        h1: ['32px', { lineHeight: '1.4' }],
        display: ['48px', { lineHeight: '1.1' }],
      },
      borderRadius: {
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
      },
      spacing: {
        touch: '56px',
        'touch-lg': '64px',
        'touch-xl': '72px',
      },
    },
  },
  plugins: [],
};
