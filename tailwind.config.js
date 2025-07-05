/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: ["class", "[data-theme='dark']"],
    theme: {
        extend: {
            colors: {
                primary: "#4f46e5",
                "primary-focus": "#4338ca",
                secondary: "#f97316",
                "secondary-focus": "#ea580c",
                accent: "#14b8a6",
                "accent-focus": "#0d9488",
            },
            fontFamily: {
                sans: ["var(--font-geist-sans)", "sans-serif"],
                mono: ["var(--font-geist-mono)", "monospace"],
            },
        },
    },
    plugins: [require("daisyui")],
    daisyui: {
        themes: [
            {
                light: {
                    primary: "#4f46e5",
                    secondary: "#f97316",
                    accent: "#14b8a6",
                    neutral: "#2a323c",
                    "base-100": "#ffffff",
                    "base-200": "#f9fafb",
                    "base-300": "#f3f4f6",
                    info: "#3b82f6",
                    success: "#22c55e",
                    warning: "#f59e0b",
                    error: "#ef4444",
                },
                dark: {
                    primary: "#818cf8",
                    secondary: "#fb923c",
                    accent: "#2dd4bf",
                    neutral: "#1f2937",
                    "base-100": "#1e293b",
                    "base-200": "#0f172a",
                    "base-300": "#020617",
                    info: "#60a5fa",
                    success: "#4ade80",
                    warning: "#fbbf24",
                    error: "#f87171",
                },
            },
        ],
        darkTheme: "dark",
        base: true,
        styled: true,
        utils: true,
    },
};
