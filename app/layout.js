import './globals.css';
import './admin/admin-design.css';
import PageTransitionLoader from '../components/PageTransitionLoader';

export const metadata = {
  title: 'Baba Hakeem | 100% Organic & Herbal Care in Pakistan',
  description: 'Pure, organic, and handcrafted herbal remedies in Pakistan. Discover our signature Hair Oil, Joint Oil, and Digestive Phakki.',
  keywords: 'Baba Hakeem, organic herbal remedies pakistan, hair oil pakistan, joint pain oil, herbal phakki, organic skincare',
  icons: {
    icon: '/joint-oil-4k.png'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body><PageTransitionLoader />{children}</body>
    </html>
  );
}
