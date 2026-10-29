'use client';

import { useEffect, useState } from 'react';
import './AdminContactSettings.css';

const EMPTY = {
  whatsapp_number: '', phone_number: '', email: '', address: '',
  facebook_url: '', instagram_url: '', tiktok_url: '', youtube_url: '',
};

const CONTACT_FIELDS = [
  ['whatsapp_number', 'WHATSAPP NUMBER', '+92 3XX XXXXXXX', 'Used for quick orders, WhatsApp checkout, and support links across the storefront.'],
  ['phone_number', 'CONTACT PHONE', '+92 3XX XXXXXXX', 'Shown as the public call / support number.'],
  ['email', 'SUPPORT EMAIL', 'care@example.com', 'Shown in the site footer and contact information.'],
  ['address', 'BUSINESS ADDRESS', 'Street, city, Pakistan', 'Optional. Leave empty to hide it from the storefront.'],
];

const SOCIAL_FIELDS = [
  ['facebook_url', 'FACEBOOK', 'https://facebook.com/your-page'],
  ['instagram_url', 'INSTAGRAM', 'https://instagram.com/your-page'],
  ['tiktok_url', 'TIKTOK', 'https://tiktok.com/@your-page'],
  ['youtube_url', 'YOUTUBE', 'https://youtube.com/@your-channel'],
];

export default function AdminContactSettings() {
  const [settings, setSettings] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/store-contact')
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not load contact settings.');
        setSettings({ ...EMPTY, ...result.settings });
      })
      .catch((issue) => setError(issue.message || 'Could not load contact settings.'));
  }, []);

  const update = (field, value) => setSettings((current) => ({ ...current, [field]: value }));

  const save = async (event) => {
    event.preventDefault();
    setBusy(true); setNotice(''); setError('');
    try {
      const response = await fetch('/api/store-contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Could not save contact settings.');
      setSettings({ ...EMPTY, ...result.settings });
      setNotice('Social links and contact details saved and published.');
    } catch (issue) { setError(issue.message || 'Could not save contact settings.'); }
    finally { setBusy(false); }
  };

  return <section className="admin-panel contact-settings-panel">
    <div className="panel-heading"><div><small>STOREFRONT / CONTACT</small><h3>Social links &amp; contact details</h3><p>These details are shared across the site. Empty social links stay hidden from visitors.</p></div></div>
    <form className="contact-settings-form" onSubmit={save}>
      <div className="contact-settings-group">
        <h4>Contact information</h4>
        <div className="contact-settings-fields">
          {CONTACT_FIELDS.map(([field, label, placeholder, help]) => (
            <label key={field} className={field === 'address' ? 'contact-settings-wide' : ''}>
              <span>{label}</span>
              {field === 'address'
                ? <textarea maxLength={600} rows={2} value={settings[field]} onChange={(event) => update(field, event.target.value)} placeholder={placeholder} />
                : <input type={field === 'email' ? 'email' : 'text'} maxLength={field === 'email' ? 254 : 40} value={settings[field]} onChange={(event) => update(field, event.target.value)} placeholder={placeholder} />}
              <small>{help}</small>
            </label>
          ))}
        </div>
      </div>

      <div className="contact-settings-group">
        <h4>Social profiles</h4>
        <div className="contact-settings-fields">
          {SOCIAL_FIELDS.map(([field, label, placeholder]) => (
            <label key={field}>
              <span>{label} URL</span>
              <input type="url" maxLength={700} value={settings[field]} onChange={(event) => update(field, event.target.value)} placeholder={placeholder} />
            </label>
          ))}
        </div>
      </div>

      {error && <p className="contact-settings-error" role="alert">{error}</p>}
      {notice && <p className="contact-settings-notice" role="status">{notice}</p>}
      <button className="publish-btn" type="submit" disabled={busy}>{busy ? 'SAVING...' : 'SAVE & PUBLISH CONTACT DETAILS'}</button>
    </form>
  </section>;
}
