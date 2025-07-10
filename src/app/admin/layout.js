'use client';
export default function AdminLoginLayout({ children }) {
	//check if user is logged in or not, if not then send them to /admin/login page forcefully.

	return <div className='min-h-screen bg-base-100'>{children}</div>;
}
