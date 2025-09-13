import '@/app/[locale]/auth/css/layout.css';

export default function AuthLayout({ children }) {
	return (
		<div className='mainLayout'>
            <div className='lang-nav'>
                <button className='lang-btn'>繁 / EN</button>
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
