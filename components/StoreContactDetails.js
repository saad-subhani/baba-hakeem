'use client';

import useStoreContactSettings, { buildWhatsAppUrl } from './useStoreContactSettings';

export function StoreWhatsAppLink({ className, children, message, ...props }) {
  const contact = useStoreContactSettings();
  const href = buildWhatsAppUrl(contact.whatsapp_number, message);
  if (!href) return null;
  return <a className={className} href={href} target="_blank" rel="noreferrer" {...props}>
    {children || `WhatsApp: ${contact.whatsapp_number}`}
  </a>;
}

export function StoreEmailLink({ className, children, ...props }) {
  const contact = useStoreContactSettings();
  if (!contact.email) return null;
  return <a className={className} href={`mailto:${contact.email}`} {...props}>{children || contact.email}</a>;
}

export default function StoreContactDetails({ className }) {
  const contact = useStoreContactSettings();
  const whatsappUrl = buildWhatsAppUrl(contact.whatsapp_number);

  return <span className={className}>
    {contact.phone_number && <>Call: <a href={`tel:${contact.phone_number.replace(/[^+\d]/g, '')}`}>{contact.phone_number}</a><br /></>}
    {whatsappUrl && <>WhatsApp: <a href={whatsappUrl} target="_blank" rel="noreferrer">{contact.whatsapp_number}</a><br /></>}
    {contact.email && <>Email: <a href={`mailto:${contact.email}`}>{contact.email}</a><br /></>}
    {contact.address && <>Address: {contact.address}</>}
  </span>;
}
