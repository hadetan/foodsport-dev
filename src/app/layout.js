import { Geist, Geist_Mono } from "next/font/google";
import LoadingBarRootClient from "./LoadingBarRootClient";
import "@/app/globals.css";
import { FaRunning } from "react-icons/fa";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "Food-Sport",
    description:
        "A gamified activity tracking app where you can take participant in events with many others!",
    icon: "/running-run-svgrepo-com.svg",
};

const activityIcons = {
    Running: { Component: FaRunning },
    // ...other activities...
};

export default async function RootLayout({ children }) {
    return (
        <html lang="en" data-theme="light">
            <head>
                <link rel="icon" href="/running-icon.svg" />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col`}
                data-theme="light"
            >
                <LoadingBarRootClient>{children}</LoadingBarRootClient>
            </body>
        </html>
    );
}
