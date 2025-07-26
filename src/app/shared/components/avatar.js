import React from "react";
const Avatar = ({ srcAvatar, firstName, lastName }) => {
    let first = firstName.charAt(0);
    let last = lastName.charAt(0);
    let initial = first + last;
    return (
        <>
            {srcAvatar === undefined ? (
                <div className="avatar avatar-placeholder">
                    <div className="mask mask-squircle w-12 h-12 bg-accent text-accent-content">
                        <span className="text-xl">{initial}</span>
                    </div>
                </div>
            ) : (
                <div className="avatar">
                    <div className="mask mask-squircle w-12 h-12">
                        <img src={srcAvatar} />
                    </div>
                </div>
            )}
        </>
    );
};

export default Avatar;
