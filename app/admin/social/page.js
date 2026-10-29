import AdminContactSettings from '../../../components/AdminContactSettings';

export const metadata = { robots: { index: false, follow: false } };

export default function AdminSocialContactPage() {
  return <main className="admin-main">
    <header className="admin-top">
      <div><small>ADMIN CONSOLE / STOREFRONT</small><h2>Social &amp; Contact</h2><p>Update the contact details and social accounts shown throughout the store.</p></div>
    </header>
    <AdminContactSettings />
  </main>;
}
