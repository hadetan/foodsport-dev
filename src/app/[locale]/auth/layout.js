import '@/app/[locale]/auth/css/layout.css';
import LocaleSwitcher from '@/app/shared/components/LocaleSwitcher';

export default function AuthLayout({ children }) {
	return (
		<div className='mainLayout'>
			<div className='lang-nav'>
				<LocaleSwitcher className='lang-btn' />
			</div>
			<div className='authLayout'>
				<div className='circle-right'></div>
				<div className='large-left-bottom'></div>
				<div className='small-left'></div>
				<div className='w-full max-w-md p-8 bg-white rounded-lg shadow-lg mainForm'>
					{children}
				</div>
			</div>
		</div>
	);
}
