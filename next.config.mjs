import dns from 'node:dns';
import createNextIntlPlugin from 'next-intl/plugin';

dns.setDefaultResultOrder('ipv4first');

/** @type {import('next').ImageRemotePattern[]} */
const remotePatterns = [
    {
        protocol: 'https',
        hostname: 'lckahydtijozvxsqrqxb.supabase.co',
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
];

const appendRemotePatternFromEnv = (value) => {
    if (!value) {
        return;
    }

    try {
        const url = new URL(value);
        const hostname = url.hostname;

        if (!hostname) {
            return;
        }

        if (remotePatterns.some((pattern) => pattern.hostname === hostname)) {
            return;
        }

        const normalizedProtocol = url.protocol.replace(':', '');
        const normalizedPathname = url.pathname === '/' ? '/**' : `${url.pathname.replace(/\/$/, '')}/**`;

        remotePatterns.push({
            protocol: normalizedProtocol,
            hostname,
            pathname: normalizedPathname,
        });
    } catch (error) {
        // ignore malformed URLs from env vars
    }
};

appendRemotePatternFromEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
appendRemotePatternFromEnv(process.env.NEXT_PUBLIC_BASEURL);

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns,
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
