'use client';

import { AdminActivitiesProvider } from "@/app/shared/contexts/AdminActivitiesContext";
import { DashboardProvider } from "@/app/shared/contexts/DashboardContext";
import { SocialMediaImageProvider } from "@/app/shared/contexts/socialMediaImageContext";

export default function AdminLoginLayout({ children }) {
	//check if user is logged in or not, if not then send them to /admin/login page forcefully.

	return (
	<div className='min-h-screen bg-base-100'>
		<DashboardProvider>
			<AdminActivitiesProvider>
				<SocialMediaImageProvider>
					{children}
				</SocialMediaImageProvider>
			</AdminActivitiesProvider>
		</DashboardProvider>
	</div>);
}
