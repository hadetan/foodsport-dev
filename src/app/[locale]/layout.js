import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import '@/app/globals.css';
import { locales } from '@/i18n/request';
import { getAlternateLinksMetadata } from '@/app/[locale]/LocaleAlternateLinks';
import { ActivitiesProvider } from '../shared/contexts/ActivitiesContext';
import { ProductsProvider } from '../shared/contexts/productsContext';

export function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
	const awaitedParams = await params;
	const locale = awaitedParams?.locale;
	const alternates = await getAlternateLinksMetadata(locale, '/');
	return {
		title: 'Food-Sport',
		description: 'A gamified activity tracking app where you can take participant in events with many others!',
		...alternates,
	};
}

export default async function LocaleRootLayout({ children, params }) {
	const awaitedParams = await params;
	const locale = awaitedParams.locale;
	setRequestLocale(locale);
	const messages = await getMessages();

	return (
		<html lang={locale} data-theme='light'>
			<body className='min-h-screen flex flex-col' data-theme='light'>
				<NextIntlClientProvider
					locale={locale}
					messages={messages}
					timeZone='Asia/Hong_Kong'
				>
					<ActivitiesProvider>
						<ProductsProvider>
							{children}
						</ProductsProvider>
					</ActivitiesProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
