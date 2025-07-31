/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['lckahydtijozvxsqrqxb.supabase.co', 'ydkwwytomdhrheykxmxl.supabase.co' ],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },
};

export default nextConfig;
