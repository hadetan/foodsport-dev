import Header from '@/app/shared/components/Header';
import Footer from '@/app/shared/components/footer';

export default async function LandingLayout({ children }) {
	return (
		<>
			{/* Landing-specific header */}
			<Header />
			<main className='flex-grow'>{children}</main>
			{/* Landing-specific footer */}
			<Footer />
		</>
	);
}
