import React, { useState } from 'react';
import '@/app/shared/css/InvitePartnersDialog.css';
import { RxCross2 } from "react-icons/rx";
import api from '@/utils/axios/api';

const initialPartner = {
  email: '',
  firstname: '',
  lastname: '',
  dateOfBirth: '',
  weight: '',
  height: '',
};

export default function InvitePartnersDialog({ activityId, open, onClose }) {
  const [partners, setPartners] = useState([{ ...initialPartner }]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  function handleChange(idx, field, value) {
    setPartners(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  }

  function isPartnerFilled(partner) {
    return partner.email && partner.firstname && partner.lastname && partner.dateOfBirth && partner.weight && partner.height;
  }

  function handleAddPartner() {
    if (!isPartnerFilled(partners[activeTab])) {
      setError('Please fill all fields before adding another partner.');
      const fields = ['email', 'firstname', 'lastname', 'dateOfBirth', 'weight', 'height'];
      for (const field of fields) {
        if (!partners[activeTab][field]) {
          const el = document.getElementById(`invite-partner-${field}`);
          if (el) el.focus();
          break;
        }
      }
      return;
    }
    setPartners(prev => [...prev, { ...initialPartner }]);
    setActiveTab(partners.length); // Switch to new tab
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
          setError('Please fill all fields for each partner.');
          setLoading(false);
          return;
        }
      }
      await api.post('/my/activities/invitePartners', {
        activityId,
        partners,
      });
      setLoading(false);
      onClose();
    } catch (err) {
      setError('Something went wrong while inviting.');
      setLoading(false);
    }
  }

  function getTabLabel(idx) {
    if (idx === 0 && partners.length === 1) return null;
    return `Tab ${idx + 1}`;
  }

  return (
    <div className="invitePartnersDialogOverlay">
      <div className="invitePartnersDialog" style={{ width: '600px', maxWidth: '98vw' }}>
        <button className="invitePartnersDialogClose" onClick={onClose} aria-label="Close">×</button>
        <div className="invitePartnersDialogTitle">Invite Partners</div>
        {/* Tabs */}
        {partners.length > 1 && (
          <div className="invitePartnersDialogTabs" style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '18px',
            justifyContent: 'flex-start',
            overflowX: 'auto',
            paddingBottom: '2px',
            maxWidth: '100%',
            scrollbarWidth: 'thin',
          }}>
            {partners.map((_, idx) => (
              <button
                key={idx}
                className={`invitePartnersDialogTab${activeTab === idx ? ' active' : ''}`}
                style={{
                  padding: '8px 32px 8px 18px',
                  borderRadius: '6px 6px 0 0',
                  border: 'none',
                  background: activeTab === idx ? '#ffe600' : '#eee',
                  color: '#222',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minWidth: '90px',
                  fontSize: '1rem',
                  outline: activeTab === idx ? '2px solid #ffe600' : 'none',
                  position: 'relative',
                  maxWidth: '180px',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}
                onClick={() => setActiveTab(idx)}
              >
                <span style={{
                //   overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '120px',
                  display: 'inline-block',
                  verticalAlign: 'middle',
                }}>{getTabLabel(idx)}</span>
                {partners.length > 1 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '50%',
                      right: '8px',
                      transform: 'translateY(-50%)',
                      color: '#d32f2f',
                      fontWeight: 700,
                      fontSize: '1.1em',
                      cursor: 'pointer',
                      display: partners.length > 1 ? 'inline' : 'none',
                      lineHeight: 1,
                    }}
                    onClick={e => { e.stopPropagation(); handleRemovePartner(idx); }}
                  ><RxCross2 /></span>
                )}
              </button>
            ))}
          </div>
        )}
        {error && <div className="invitePartnersDialogError">{error}</div>}
        <form className="invitePartnersDialogForm" onSubmit={e => e.preventDefault()}>
          <div className="invitePartnersDialogFormGrid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 24px' }}>
            <div>
              <div className="invitePartnersDialogLabel">First Name</div>
              <input id="invite-partner-firstname" className="invitePartnersDialogInput" type="text" value={partners[activeTab].firstname} onChange={e => handleChange(activeTab, 'firstname', e.target.value)} required />
            </div>
            <div>
              <div className="invitePartnersDialogLabel">Last Name</div>
              <input id="invite-partner-lastname" className="invitePartnersDialogInput" type="text" value={partners[activeTab].lastname} onChange={e => handleChange(activeTab, 'lastname', e.target.value)} required />
            </div>
            <div>
              <div className="invitePartnersDialogLabel">Email</div>
              <input id="invite-partner-email" className="invitePartnersDialogInput" type="email" value={partners[activeTab].email} onChange={e => handleChange(activeTab, 'email', e.target.value)} required />
            </div>
            <div>
              <div className="invitePartnersDialogLabel">Date of Birth</div>
              <input id="invite-partner-dateOfBirth" className="invitePartnersDialogInput" type="date" value={partners[activeTab].dateOfBirth} onChange={e => handleChange(activeTab, 'dateOfBirth', e.target.value)} required />
            </div>
            <div>
              <div className="invitePartnersDialogLabel">Weight (kg)</div>
              <input id="invite-partner-weight" className="invitePartnersDialogInput" type="number" min="1" max="999.99" step="0.01" value={partners[activeTab].weight} onChange={e => handleChange(activeTab, 'weight', e.target.value)} required />
            </div>
            <div>
              <div className="invitePartnersDialogLabel">Height (cm)</div>
              <input id="invite-partner-height" className="invitePartnersDialogInput" type="number" min="1" max="999.99" step="0.01" value={partners[activeTab].height} onChange={e => handleChange(activeTab, 'height', e.target.value)} required />
            </div>
          </div>
        </form>
        <div className="invitePartnersDialogActions">
          <button className="invitePartnersDialogCancelBtn" type="button" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="invitePartnersDialogMoreBtn" type="button" onClick={handleAddPartner} disabled={loading}>Add More</button>
          <button className="invitePartnersDialogBtn" type="button" onClick={handleInvite} disabled={loading}>{loading ? 'Inviting...' : 'Invite'}</button>
        </div>
      </div>
    </div>
  );
}
