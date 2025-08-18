import React from "react";

export const Status = ({ statusOfUser }) => {
    return (
        <>
            <span
                className={`badge badge-outline ${
                    statusOfUser === true ? "badge-success" : "badge-error"
                }`}
            >
                {statusOfUser === true ? "Active" : "Inactive"}
            </span>
        </>
    );
};

export default Status;
