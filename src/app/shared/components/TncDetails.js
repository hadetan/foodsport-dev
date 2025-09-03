import React from 'react';

const TncDetails = ({ title, description }) => {
    return (
        <div className='tncDetails'>
            <h1 className='tncDetailsTitle text-2xl font-bold mt-4 mb-2'>{title}</h1>
            <div className='tncDetailsDescription'>{description}</div>
        </div>
    );
};

export default TncDetails;
