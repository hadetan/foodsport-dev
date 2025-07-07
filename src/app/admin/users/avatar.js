import React from "react";

const Avatar = ({ srcAvatar, nameOfUser }) => {
    let letter = nameOfUser.charAt(0);
    return (
        <>
            {srcAvatar === "" ? (
                <div class="avatar avatar-online avatar-placeholder">
                    <div class="bg-neutral text-neutral-content w-16 rounded-full">
                        <span className="text-xl">{letter}</span>
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
