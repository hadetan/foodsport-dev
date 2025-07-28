import { Geist, Geist_Mono } from 'next/font/google';
import { AuthProvider } from '@/app/shared/contexts/authContext';
import '@/app/globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata = {
	title: 'Food-Sport',
	description:
		'A gamified activity tracking app where you can take participant in events with many others!',
};
export default async function RootLayout({ children }) {
	return (
		<html lang='en'>
			<body
				className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col`}
			>
				<AuthProvider>{children}</AuthProvider>
			</body>
		</html>
	);
}
