'use client';
import { useState } from 'react';
import { HiEye, HiEyeOff } from 'react-icons/hi';

export default function PasswordInputClient({ value = '', onChange = () => {}, id = 'password', name = 'password', placeholder = '', required = false, className = '' }) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative">
            <input
                id={id}
                name={name}
                type={visible ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                required={required}
                className={`input input-bordered w-full pr-10 ${className}`}
                aria-label={placeholder || 'password'}
            />
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1 flex items-center justify-center rounded-md hover:bg-base-200"
                aria-label={visible ? 'Hide password' : 'Show password'}
                aria-pressed={visible}
            >
                {visible ? (
                    <HiEyeOff className="w-5 h-5" aria-hidden="true" />
                ) : (
                    <HiEye className="w-5 h-5" aria-hidden="true" />
                )}
            </button>
        </div>
    );
}
