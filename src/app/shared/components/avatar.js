'use client';

import { useRouter } from "next/navigation";
import React from "react";

const Avatar = ({ srcAvatar, firstName='', lastName='', isNav=false, pointer=false, size='8' }) => {
    const first = firstName?.[0]?.toUpperCase() || '';
    const last = lastName?.[0]?.toUpperCase() || '';
    const router = useRouter();
    const [broken, setBroken] = React.useState(false);
    
    const maskClass = isNav
    ? `mask mask-circle w-${size} h-${size} bg-accent text-accent-content select-none ${pointer && 'cursor-pointer'}`
    : "mask mask-squircle w-12 h-12 bg-accent text-accent-content select-none";
    const imgMaskClass = isNav
    ? `mask mask-circle w-${size} h-${size} bg-accent text-accent-content select-none ${pointer && 'cursor-pointer'}`
    : "mask mask-squircle w-12 h-12 bg-accent text-accent-content select-none";
    
    const handleClick = () => {
        router.push('/my/profile');
    }

    const normalizeGoogle = (url) => {
        if (!url.includes('googleusercontent.com')) return url;
        // Ensure a size parameter to avoid Google dynamic resizing delays; keep existing size if present.
        if (/=[swh]\d+/.test(url)) return url;
        if (url.includes('=')) return url + '-c'; // already has a param base, append crop
        return url + '=s128-c';
    };

    const avatarUrl = React.useMemo(() => {
        if (!srcAvatar || broken) return null;
        if (srcAvatar.includes('googleusercontent')) {
            return normalizeGoogle(srcAvatar);
        }
        if (/^https?:\/\//i.test(srcAvatar)) return srcAvatar;
        return `${process.env.NEXT_PUBLIC_SUPABASE_URL}${srcAvatar}`;
    }, [srcAvatar, broken]);

    return (
        <div onClick={() => pointer && handleClick()}>
            {!avatarUrl ? (
                <div className="avatar avatar-placeholder">
                    <div className={maskClass}>
                        <span className={isNav ? size : "text-xl"}>{`${first}${last}`}</span>
                    </div>
                </div>
            ) : (
                <div className="avatar">
                    <div className={imgMaskClass}>
                        <img
                            src={avatarUrl}
                            alt={`${firstName} ${lastName} avatar`}
                            referrerPolicy="no-referrer"
                            loading={isNav ? 'eager' : 'lazy'}
                            decoding="async"
                            onError={() => setBroken(true)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Avatar;
