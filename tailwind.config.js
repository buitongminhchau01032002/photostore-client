/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./*.{html,js}', './upload/*.{html,js}', './photo/*.{html,js}', './js/*.js'],
    theme: {
        extend: {
            spacing: {
                'h-header': 'var(--h-header)',
                'h-wrap-header': 'var(--h-wrap-header)',
                'h-toast': 'var(--h-toast)',
            },

            colors: {
                primary:
                    'hsl(var(--clr-primary-h) var(--clr-primary-s) var(--clr-primary-l) / <alpha-value>)',
                'primary-hover':
                    'hsl(var(--clr-primary-h) var(--clr-primary-s) var(--clr-primary-hover-l) / <alpha-value>)',
                'clr-text': 'hsl(var(--clr-text) / <alpha-value>)',
                'clr-text-dark': 'hsl(var(--clr-text-dark) / <alpha-value>)',
                'light-gray': 'hsl(var(--clr-light-gray) / <alpha-value>)',
                white: 'hsl(var(--clr-white) / <alpha-value>)',

                transparent: 'transparent',
                current: 'currentColor',
            },

            zIndex: {
                header: 100,
                toast: 1000,
            },
        },
        screens: {
            sm: '576px',
            md: '960px',
            lg: '1280px',
            xl: '1540px',
        },
    },
    plugins: [],
};
