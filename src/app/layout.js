import LoadingBarRootClient from '@/app/LoadingBarRootClient';

export async function generateMetadata() {
    return {
        icons: {
            icon: "/running.svg",
        },
    };
}

export default function RootLayout({ children }) {
	return <LoadingBarRootClient>{children}</LoadingBarRootClient>;
}
