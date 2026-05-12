/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#059669", // Emerald Solid
                secondary: "#7c3aed", // Royal Violet
                danger: "#e11d48", // Rose Solid
                dark: "#0f172a", // Deep Slate
                light: "#f8fafc", // Soft Slate
                border: "#e2e8f0", // Structural Border
            },
            borderRadius: {
                'none': '0',
                'sm': '0',
                'DEFAULT': '0',
                'md': '0',
                'lg': '0',
                'xl': '0',
                '2xl': '0',
                '3xl': '0',
                'full': '0',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
