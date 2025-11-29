"use client";

import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import axiosClient from '@/utils/axios/api';

export default function ForbiddenPage() {
  const t = useTranslations('AccountBanned');
  const router = useRouter();
  const locale = useLocale();

  const handleLogout = async () => {
    try {
      await axiosClient.delete('/auth/logout');
    } catch (err) { }
    try { localStorage.removeItem('auth_token'); localStorage.removeItem('refresh_token'); } catch (e) {}
    router.push(`/${locale}/auth/login`);
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold text-error">403</h1>
          <p className="py-6 text-xl">{t('title')}</p>
          <p className="mb-6 text-gray-600">{t('message')}</p>
          <div className="flex justify-center gap-4">
            <a href={`mailto:${t('contactEmail')}`} target="_blank" rel="noreferrer" className="btn btn-outline">{t('contactSupport')}</a>
            <button onClick={handleLogout} className="btn btn-primary">{t('logout')}</button>
          </div>
          <div className="mt-6">
            <a href={`/${locale}`} className="text-sm text-gray-500">{t('backHome')}</a>
          </div>
        </div>
      </div>
    </div>
  );
}
