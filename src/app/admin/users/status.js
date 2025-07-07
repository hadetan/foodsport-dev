import React from "react";

export const Status = ({ statusOfUser }) => {
    let statusName = statusOfUser.substring(1);

    let updatedStatus = statusOfUser.charAt(0).toUpperCase() + statusName
    return (
        <>
            <span
                className={`badge badge-outline ${statusOfUser === "active" ? "badge-success" : "badge-error"
                }`}
            >
                {updatedStatus}
            </span>
        </>
    );
};

export default Status;
