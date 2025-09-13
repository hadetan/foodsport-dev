import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['lckahydtijozvxsqrqxb.supabase.co', 'ydkwwytomdhrheykxmxl.supabase.co', 'lh3.googleusercontent.com' ],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
