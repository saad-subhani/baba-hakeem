'use client';

import { useEffect, useState } from 'react';

const DEFAULT_SETTINGS = {
  whatsapp_number: '+92 323 9992203',
  phone_number: '+92 323 9992203',
  email: 'care@babahakeem.pk',
  address: '',
  facebook_url: '',
  instagram_url: '',
  tiktok_url: '',
  youtube_url: '',
};

export function getWhatsAppDigits(number) {
  let digits = String(number || '').replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = `92${digits.slice(1)}`;
  return digits;
}

export function buildWhatsAppUrl(number, message) {
  const digits = getWhatsAppDigits(number);
  if (!digits) return '';
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

export default function useStoreContactSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    let live = true;
    fetch('/api/store-contact')
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        if (live && result?.settings) setSettings({ ...DEFAULT_SETTINGS, ...result.settings });
      })
      .catch(() => {});
    return () => { live = false; };
  }, []);

  return settings;
}

export { DEFAULT_SETTINGS };
