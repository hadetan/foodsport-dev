import React from "react";

export const Status = ({ statusOfUser, isRegistered }) => {
    // Handle unregistered users
    if (isRegistered === false) {
        return (
            <span className="badge badge-outline badge-warning">
                Unregistered
            </span>
        );
    }

    return (
        <span
            className={`badge badge-outline ${
                statusOfUser === true ? "badge-success" : "badge-error"
            }`}
        >
            {statusOfUser === true ? "Active" : "Inactive"}
        </span>
    );
};

export default Status;
