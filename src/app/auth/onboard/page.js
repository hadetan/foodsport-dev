"use client";
import { useEffect, useState } from 'react';
import api from '@/utils/axios/api';
import { DISTRICTS } from '@/app/constants/constants';

export default function OnboardPage() {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ dateOfBirth: '', weight: '', height: '', district: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/auth/pre-profile');
        const { preProfile } = res.data || {};
        if (!preProfile) {
          window.location.href = '/auth/login';
          return;
        }
        setLoading(false);
      } catch (e) {
        setError('Failed to load.');
        setLoading(false);
      }
    })();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form };
      const res = await api.post('/auth/complete-onboarding', payload);
      window.location.href = '/my';
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to complete onboarding.');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-base-100 rounded">
        <h1 className="text-2xl font-semibold mb-4">Onboarding</h1>
        {error && <div className="alert alert-error mb-4">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="label"><span className="label-text">Date of Birth</span></label>
            <input type="date" className="input input-bordered w-full" required value={form.dateOfBirth} onChange={(e)=>setForm(f=>({...f, dateOfBirth:e.target.value}))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label"><span className="label-text">Weight (kg)</span></label>
              <input type="number" step="0.01" className="input input-bordered w-full" value={form.weight} onChange={(e)=>setForm(f=>({...f, weight:e.target.value}))} />
            </div>
            <div>
              <label className="label"><span className="label-text">Height (cm)</span></label>
              <input type="number" step="0.01" className="input input-bordered w-full" value={form.height} onChange={(e)=>setForm(f=>({...f, height:e.target.value}))} />
            </div>
          </div>
          <div>
            <label className="label"><span className="label-text">District</span></label>
            <select
              className="select select-bordered w-full"
              value={form.district}
              onChange={(e)=>setForm(f=>({...f, district:e.target.value}))}
            >
              <option value="">Select a district (optional)</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d
                    .split('_')
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                    .join(' ')}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary w-full">Finish</button>
        </form>
      </div>
    </div>
  );
}
