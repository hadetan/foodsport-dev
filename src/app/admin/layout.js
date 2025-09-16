'use client';
import '@/app/globals.css'

export default function AdminLoginLayout({ children }) {
	return (
		<html data-theme='light'>
			<body data-theme='light'>
				<div className='min-h-screen bg-base-100'>{children}</div>
			</body>
		</html>
	)
}
