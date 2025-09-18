import React from 'react';
import '@/app/shared/css/ActivitySearchNotFound.css';
import { HiOutlineEmojiSad } from 'react-icons/hi';
import { IoIosArrowBack } from 'react-icons/io';
import { useTranslations } from 'next-intl';

export default function ActivitySearchNotFound({ backHref = '/activities', description, handleReset }) {
    const t = useTranslations('Activity.DetailsPage');
    const handleBack = () => {
        handleReset();
    }
    return (
        <div className="activitySearchNotFound">
            <div className="activitySearchNotFound__icon">
                <HiOutlineEmojiSad />
            </div>
            <h3 className="activitySearchNotFound__title">{t('noSearchActivityTitle') || 'The activity you searched for was not found'}</h3>
            <p className="activitySearchNotFound__desc">
                {description || t('noSearchActivityDesc') || 'Please check your search terms or filters and try again.'}
            </p>
            <button className="activitySearchNotFound__btn" onClick={handleBack}>
                <span className="activitySearchNotFound__backIcon"><IoIosArrowBack /></span>
                {t('back')}
            </button>
        </div>
    );
}
