'use client';

import { useEffect, useState } from 'react';
import './AdminBankSettings.css';

const blank = { account_title: '', bank_name: '', logo_url: '', iban: '', account_number: '', enabled: false };

export default function AdminBankSettings() {
  const [details, setDetails] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/bank-details').then((response) => response.json()).then((result) => {
      if (result.bankDetails) setDetails({ ...blank, ...result.bankDetails, enabled: Boolean(Number(result.bankDetails.enabled)) });
      else if (result.error) setError(result.error);
    }).catch(() => setError('Could not load bank details.'));
  }, []);

  const setField = (name, value) => setDetails((current) => ({ ...current, [name]: value }));

  const uploadLogo = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 4 * 1024 * 1024) {
      setError('Choose an image smaller than 4 MB.');
      return;
    }
    setUploading(true); setError(''); setNotice('');
    try {
      const form = new FormData(); form.append('file', file);
      const response = await fetch('/api/local/upload', { method: 'POST', body: form });
      const result = await response.json();
      if (!response.ok || !result.url) throw new Error(result.error?.message || 'Could not upload the bank logo.');
      setField('logo_url', result.url); setNotice('Logo uploaded. Save the bank details to publish it.');
    } catch (issue) { setError(issue.message || 'Could not upload the bank logo.'); }
    finally { setUploading(false); }
  };

  const save = async (event) => {
    event.preventDefault(); setBusy(true); setNotice(''); setError('');
    try {
      const response = await fetch('/api/bank-details', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(details) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Could not save bank details.');
      setNotice('Bank transfer settings saved.');
    } catch (issue) { setError(issue.message || 'Could not save bank details.'); }
    finally { setBusy(false); }
  };

  return <section className="admin-panel bank-settings-panel" id="bank-settings">
    <div className="panel-heading"><div><small>CHECKOUT / PAYMENT</small><h3>Bank transfer details</h3><p>Configure the account customers see when they choose bank transfer.</p></div><span>{details.enabled ? 'BANK TRANSFER ON' : 'BANK TRANSFER OFF'}</span></div>
    <form className="bank-settings-form" onSubmit={save}>
      <div className="bank-settings-fields">
        <label><span>ACCOUNT TITLE *</span><input maxLength="160" required={details.enabled} value={details.account_title} onChange={(event) => setField('account_title', event.target.value)} placeholder="Account holder name" /></label>
        <label><span>BANK NAME *</span><input maxLength="120" required={details.enabled} value={details.bank_name} onChange={(event) => setField('bank_name', event.target.value)} placeholder="Bank or wallet name" /></label>
        <label><span>IBAN *</span><input maxLength="80" required={details.enabled} value={details.iban} onChange={(event) => setField('iban', event.target.value)} placeholder="PK00..." /></label>
        <label><span>ACCOUNT NUMBER *</span><input maxLength="80" required={details.enabled} value={details.account_number} onChange={(event) => setField('account_number', event.target.value)} placeholder="Account number" /></label>
        <label className="bank-logo-field"><span>BANK LOGO</span><input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" disabled={uploading} onChange={(event) => uploadLogo(event.target.files?.[0])} />{details.logo_url && <img src={details.logo_url} alt="Bank logo preview" />}</label>
      </div>
      <label className="bank-settings-toggle"><input type="checkbox" checked={details.enabled} onChange={(event) => setField('enabled', event.target.checked)} /><span>Show bank transfer as a payment option at checkout</span></label>
      {error && <p className="bank-settings-error" role="alert">{error}</p>}{notice && <p className="bank-settings-notice" role="status">{notice}</p>}
      <button className="publish-btn" type="submit" disabled={busy || uploading}>{uploading ? 'UPLOADING LOGO...' : busy ? 'SAVING...' : 'SAVE BANK DETAILS'}</button>
    </form>
  </section>;
}
