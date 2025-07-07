import React from "react";

export const Status = ({ statusOfUser }) => {
    let statusName = statusOfUser.substring(1);

    let updatedStatus = statusOfUser.charAt(0).toUpperCase() + statusName
    return (
        <>
            <span
                className={`badge ${
                    statusOfUser === "active" ? "bg-green-500" : "bg-red-500"
                }`}
            >
                {updatedStatus}
            </span>
        </>
    );
};

export default Status;
