import React from "react";

const FullPageLoader = ({ text = "Processing..." }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-base-100 rounded-lg p-4 flex flex-col items-center space-y-2">
            <span className="loading loading-spinner loading-lg"></span>
            <p className="text-base-content">{text}</p>
        </div>
    </div>
);

export default FullPageLoader;
