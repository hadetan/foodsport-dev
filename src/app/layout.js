import LoadingBarRootClient from './LoadingBarRootClient';
import { NextIntlClientProvider } from 'next-intl';

export default async function RootLayout({ children }) {
	return (
		<NextIntlClientProvider>
			<LoadingBarRootClient>{children}</LoadingBarRootClient>
		</NextIntlClientProvider>
	);
}
