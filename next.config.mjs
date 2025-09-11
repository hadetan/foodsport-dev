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

export default nextConfig;
