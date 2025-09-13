import Header from '@/app/shared/components/Header';
import Footer from '@/app/shared/components/footer';
import { UserProvider } from '@/app/shared/contexts/userContext';
import '@/app/shared/css/public.css';

export default async function MyLayout({ children }) {
	return (
		<>
			<UserProvider>
				<Header />
				<main className='flex-grow'>{children}</main>
			</UserProvider>
			<Footer />
		</>
	);
}
