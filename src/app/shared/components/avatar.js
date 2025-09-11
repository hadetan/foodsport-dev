'use client';

import { useRouter } from "next/navigation";
import React from "react";

const Avatar = ({ srcAvatar, firstName, lastName, isNav=false, pointer=false, size='8' }) => {
    let first = firstName.charAt(0).toUpperCase();
    let last = lastName.charAt(0).toUpperCase();
    const router = useRouter()
    
    const maskClass = isNav
    ? `mask mask-circle w-${size} h-${size} bg-accent text-accent-content select-none ${pointer && 'cursor-pointer'}`
    : "mask mask-squircle w-12 h-12 bg-accent text-accent-content select-none";
    const imgMaskClass = isNav
    ? `mask mask-circle w-${size} h-${size} bg-accent text-accent-content select-none ${pointer && 'cursor-pointer'}`
    : "mask mask-squircle w-12 h-12 bg-accent text-accent-content select-none";
    
    const handleClick = () => {
        router.push('/my/profile');
    }

    const avatarUrl = (() => {
        if (!srcAvatar) return null;
        if (srcAvatar.includes('googleusercontent') || /^https?:\/\//i.test(srcAvatar)) {
            return srcAvatar;
        }
        return `${process.env.NEXT_PUBLIC_SUPABASE_URL}${src}`;
    })();

    return (
        <div onClick={() => pointer && handleClick()}>
            {!srcAvatar ? (
                <div className="avatar avatar-placeholder">
                    <div className={maskClass}>
                        <span className={isNav ? size : "text-xl"}>{`${first}${last}`}</span>
                    </div>
                </div>
            ) : (
                <div className="avatar">
                    <div className={imgMaskClass}>
                        <img src={avatarUrl} alt={`${firstName} ${lastName} avatar`} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Avatar;
