/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#10b981", // Emerald 500 - Success/Money
                secondary: "#3b82f6", // Blue 500 - Actions
                danger: "#ef4444", // Red 500 - Debt/Errors
                dark: "#1e293b", // Slate 800 - Text/Headings
                light: "#f1f5f9", // Slate 100 - Backgrounds
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
