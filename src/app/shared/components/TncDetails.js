import React from 'react';
import DOMPurify from 'dompurify';
import '@/app/shared/css/TncDetails.css';

const TncDetails = ({ title, description }) => {
    const clean = DOMPurify.sanitize(description);
    return (
        <div className='tncDetails'>
            <h1 className='tncDetailsTitle text-2xl font-bold mt-4 mb-2'>{title}</h1>
            <div className='tncDetailsDescription'>
                <div
                    dangerouslySetInnerHTML={{ __html: clean }}
                />
            </div>
        </div>
    );
};

export default TncDetails;
