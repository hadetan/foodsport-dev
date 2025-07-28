import Header from '@/app/shared/components/Header';
import Footer from '@/app/shared/components/footer';
import { UserProvider } from '@/app/shared/contexts/userContext';

export default async function MyLayout({ children }) {
	return (
		<>
			<Header />
			<UserProvider>
					<main className='flex-grow'>{children}</main>
			</UserProvider>
			<Footer />
		</>
	);
}
