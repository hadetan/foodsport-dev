import React, { useState } from 'react';
import '@/app/shared/css/InvitePartnersDialog.css';
import { RxCross2 } from "react-icons/rx";
import api from '@/utils/axios/api';
import { useTranslations } from 'next-intl';

const initialPartner = {
  email: '',
};

export default function InvitePartnersDialog({ activityId, open, onClose }) {
  const t = useTranslations('InvitePartnersDialog');
  const [partners, setPartners] = useState([{ ...initialPartner }]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  function handleChange(idx, field, value) {
    setPartners(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  }

  function isPartnerFilled(partner) {
    return partner.email;
  }

  function handleAddPartner() {
    if (!isPartnerFilled(partners[activeTab])) {
      setError(t('errors.fillBeforeAdd'));
      const el = document.getElementById(`invite-partner-email`);
      if (el) el.focus();
      return;
    }
    setPartners(prev => [...prev, { ...initialPartner }]);
    setActiveTab(partners.length);
    setError('');
  }

  function handleRemovePartner(idx) {
    if (partners.length === 1) return;
    setPartners(prev => prev.filter((_, i) => i !== idx));
    setActiveTab(prev => prev > 0 ? prev - 1 : 0);
  }

  async function handleInvite() {
    setError('');
    setLoading(true);
    try {
      for (const p of partners) {
        if (!isPartnerFilled(p)) {
          setError(t('errors.fillEach'));
          setLoading(false);
          return;
        }
      }
      const partnerEmails = partners.map(p => p.email.trim().toLowerCase());
      await api.post('/my/activities/invitePartners', {
        activityId,
        partners: partnerEmails,
      });
      setLoading(false);
      onClose();
    } catch (err) {
      setError(t('errors.inviteFailed'));
      setLoading(false);
    }
  }

  function getTabLabel(idx) {
    if (idx === 0 && partners.length === 1) return null;
    return `${t('tab')} ${idx + 1}`;
  }

  return (
    <div className="invitePartnersDialogOverlay">
      <div className="invitePartnersDialog">
        <button className="invitePartnersDialogClose" onClick={onClose} aria-label="Close">×</button>
  <div className="invitePartnersDialogTitle">{t('title')}</div>
        {/* Tabs */}
        {partners.length > 1 && (
          <div className="invitePartnersDialogTabs">
            {partners.map((_, idx) => (
              <button
                key={idx}
                className={`invitePartnersDialogTab${activeTab === idx ? ' active' : ''}`}
                onClick={() => setActiveTab(idx)}
              >
                <span className="invitePartnersDialogTabLabel">{getTabLabel(idx)}</span>
                {partners.length > 1 && (
                  <span
                    className="invitePartnersDialogTabRemove"
                    onClick={e => { e.stopPropagation(); handleRemovePartner(idx); }}
                  ><RxCross2 /></span>
                )}
              </button>
            ))}
          </div>
        )}
        {error && <div className="invitePartnersDialogError">{error}</div>}
        <form className="invitePartnersDialogForm" onSubmit={e => e.preventDefault()}>
          <div className="invitePartnersDialogFormGrid">
            <div>
              <div className="invitePartnersDialogLabel">{t('emailLabel')}</div>
              <input id="invite-partner-email" className="invitePartnersDialogInput" type="email" value={partners[activeTab].email} onChange={e => handleChange(activeTab, 'email', e.target.value)} required />
            </div>
          </div>
        </form>
        <div className="invitePartnersDialogActions">
          <button className="invitePartnersDialogCancelBtn" type="button" onClick={onClose} disabled={loading}>{t('buttons.cancel')}</button>
          <button className="invitePartnersDialogMoreBtn" type="button" onClick={handleAddPartner} disabled={loading}>{t('buttons.addMore')}</button>
          <button className="invitePartnersDialogBtn" type="button" onClick={handleInvite} disabled={loading}>{loading ? t('buttons.inviting') : t('buttons.invite')}</button>
        </div>
      </div>
    </div>
  );
}
