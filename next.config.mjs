import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lckahydtijozvxsqrqxb.supabase.co',
                // allow any path
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'ydkwwytomdhrheykxmxl.supabase.co',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'xqvyueaxiilcdpcczuuc.supabase.co',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: '43.199.233.21',
                pathname: '/**',
            },
        ],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
