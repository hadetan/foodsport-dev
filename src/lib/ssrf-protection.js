import dns from 'node:dns/promises';
import net from 'node:net';

function ipToInt(ip) {
    const parts = ip.split('.').map((p) => parseInt(p, 10));
    if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return null;
    return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + (parts[3] << 0);
}

function isIPv4Private(ip) {
    const num = ipToInt(ip);
    if (num === null) return false;
    // 10.0.0.0/8
    if (num >= 0x0a000000 && num <= 0x0affffff) return true;
    // 100.64.0.0/10
    if (num >= 0x64400000 && num <= 0x647fffff) return true;
    // 127.0.0.0/8
    if (num >= 0x7f000000 && num <= 0x7fffffff) return true;
    // 169.254.0.0/16 Link local
    if (num >= 0xa9fe0000 && num <= 0xa9feffff) return true;
    // 172.16.0.0/12
    if (num >= 0xac100000 && num <= 0xac1fffff) return true;
    // 192.0.0.0/24 (http://example.net/)
    // 192.0.2.0/24 TEST-NET-1
    // 192.168.0.0/16
    if (num >= 0xc0a80000 && num <= 0xc0a8ffff) return true;
    // 198.18.0.0/15 (benchmarking)
    if (num >= 0xc6120000 && num <= 0xc613ffff) return true;
    // 224.0.0.0/4 Multicast
    if (num >= 0xe0000000 && num <= 0xffffffff) return true;
    return false;
}

function isIPv6Private(ip) {
    if (!ip.includes(':')) return false;
    const normalized = ip.toLowerCase();
    if (normalized === '::1') return true;
    if (normalized.startsWith('fe80:')) return true; // link-local
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true; // unique local
    return false;
}

function isReservedHost(hostname) {
    const name = hostname.toLowerCase();
    if (name === 'localhost' || name === 'ip6-localhost' || name === '0.0.0.0') return true;
    if (name === '169.254.169.254') return true; // AWS/GCP metadata endpoint
    return false;
}

export async function isSafeImageUrl(urlString, allowedOrigins = []) {
    if (!urlString) return false;
    let parsed;
    try {
        parsed = new URL(urlString);
    } catch (_err) {
        return false;
    }

    const proto = parsed.protocol.toLowerCase();
    if (proto !== 'http:' && proto !== 'https:') return false;

    // If allowedOrigins is configured, the origin must match one of those values.
    const origin = `${parsed.protocol}//${parsed.hostname}${parsed.port ? `:${parsed.port}` : ''}`;
    if (Array.isArray(allowedOrigins) && allowedOrigins.length > 0) {
        for (const allowed of allowedOrigins) {
            if (!allowed) continue;
            try {
                const allowedOrigin = new URL(allowed);
                if (allowedOrigin.origin === origin) return true;
            } catch (_e) {
                // if it's a hostname only
                if (allowed === parsed.hostname) return true;
            }
        }
        // Not in allowed list
        return false;
    }

    // Block loopback/reserved hostnames immediately
    if (isReservedHost(parsed.hostname)) return false;

    // Resolve DNS and ensure addresses are not private
    try {
        const records = await dns.lookup(parsed.hostname, { all: true });
        for (const r of records) {
            if (!r || !r.address) continue;
            if (net.isIP(r.address) === 4) {
                if (isIPv4Private(r.address)) return false;
            } else if (net.isIP(r.address) === 6) {
                if (isIPv6Private(r.address)) return false;
            }
        }
    } catch (err) {
        // If DNS cannot be resolved, don't allow fetch
        console.warn('DNS lookup failed for image proxy hostname:', err?.message || err);
        return false;
    }

    return true;
}

export function getAllowedImageOriginsFromEnv() {
    const env = process.env.NEXT_PUBLIC_ALLOWED_IMAGE_ORIGINS || '';
    if (!env) {
        // fall back to supabase storage origin if available
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (supabaseUrl) {
            try {
                const p = new URL(supabaseUrl);
                return [p.origin];
            } catch (_err) {
                return [];
            }
        }
        return [];
    }

    return env
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => {
            try {
                return new URL(s).origin;
            } catch (_err) {
                return s;
            }
        });
}
