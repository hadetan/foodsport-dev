import React from "react";

export const Status = ({ statusOfUser }) => {
    let uppercase = statusOfUser.charAt(0).toUpperCase();
    let statusName = statusOfUser.substring(1);
    console.log(statusName);
    return (
        <>
            <span
                className={`badge ${
                    statusOfUser === "active" ? "bg-green-500" : "bg-red-500"
                }`}
            >
                {uppercase + statusName}
            </span>
        </>
    );
};

export default Status;
