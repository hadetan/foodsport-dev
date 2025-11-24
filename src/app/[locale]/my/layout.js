import Header from '@/app/shared/components/Header';
import Footer from '@/app/shared/components/footer';
import { UserProvider } from '@/app/shared/contexts/userContext';
import { MyBadgesProvider } from '@/app/shared/contexts/myBadgesContext';
import '@/app/shared/css/public.css';

export default async function MyLayout({ children }) {
	return (
		<>
			<UserProvider>
				<MyBadgesProvider>
					<Header />
					<main className='flex-grow'>{children}</main>
				</MyBadgesProvider>
			</UserProvider>
			<Footer />
		</>
	);
}
