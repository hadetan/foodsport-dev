import { Geist, Geist_Mono } from "next/font/google";
import LoadingBarRootClient from "./LoadingBarRootClient";
import "@/app/globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default async function RootLayout({ children }) {
    return (
        <html lang="en" data-theme="light">
            <title> Food Sport</title>
            <head>
                <link
                    rel="icon"
                    type="image/svg+xml"
                    href="data:image/svg+xml,%3Csvg%20width%3D%22800px%22%20height%3D%22800px%22%20viewBox%3D%220%200%2024%2024%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M12.1%203A1.9%201.9%200%201%201%2014%204.9%201.898%201.898%200%200%201%2012.1%203zm2.568%204.893c.26-1.262-1.399-1.861-2.894-2.385L7.09%206.71l.577%204.154c0%20.708%201.611.489%201.587-.049l-.39-2.71%202.628-.48-.998%204.92%203.602%204.179-1.469%204.463a.95.95%200%200%200%20.39%201.294c.523.196%201.124-.207%201.486-.923.052-.104%201.904-5.127%201.904-5.127l-2.818-3.236%201.08-5.303zm-5.974%208.848l-3.234.528a1.033%201.033%200%200%200-.752%201.158c.035.539.737.88%201.315.802l3.36-.662%202.54-2.831-1.174-1.361zm8.605-7.74l-1.954.578-.374%201.837%202.865-.781a.881.881%200%200%200-.537-1.633z%22%20fill%3D%22%23000%22/%3E%3Cpath%20fill%3D%22none%22%20d%3D%22M0%200h24v24H0z%22/%3E%3C/svg%3E"
                />
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
