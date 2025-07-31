import Header from '@/app/shared/components/Header';
import Footer from '@/app/shared/components/footer';
import { UserProvider } from '../shared/contexts/userContext';

export default async function LandingLayout({ children }) {
	return (
		<>
			{/* Landing-specific header */}
			<UserProvider>
				<Header />
			</UserProvider>
			<main className='flex-grow'>{children}</main>
			{/* Landing-specific footer */}
			<Footer />
		</>
	);
}
