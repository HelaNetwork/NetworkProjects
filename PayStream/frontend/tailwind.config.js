/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                hela: {
                    50: '#eef7ff',
                    100: '#d9ecff',
                    200: '#bce0ff',
                    300: '#8eceff',
                    400: '#59b2ff',
                    500: '#338eff',
                    600: '#1a6ff5',
                    700: '#1358e1',
                    800: '#1648b6',
                    900: '#183f8f',
                    950: '#132857',
                },
            },
        },
    },
    plugins: [],
};
