import Header from '@/app/shared/components/Header';
import Footer from '@/app/shared/components/footer';
import { ActivitiesProvider } from '@/app/shared/contexts/ActivitiesContext';
import { UserProvider } from '@/app/shared/contexts/userContext';

export default async function MyLayout({ children }) {
	return (
		<>
			<Header />
			<UserProvider>
				<ActivitiesProvider>
					<main className='flex-grow'>{children}</main>
				</ActivitiesProvider>
			</UserProvider>
			<Footer />
		</>
	);
}
