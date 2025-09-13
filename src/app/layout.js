import LoadingBarRootClient from '@/app/LoadingBarRootClient';

export default function RootLayout({ children }) {
	return <LoadingBarRootClient>{children}</LoadingBarRootClient>;
}
