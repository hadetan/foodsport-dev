'use client';
import '@/app/globals.css'

export default function AdminLoginLayout({ children }) {
	//check if user is logged in or not, if not then send them to /admin/login page forcefully.

	return (
		<html>
			<body>
				<div className='min-h-screen bg-base-100'>{children}</div>;
			</body>
		</html>
	)
}
