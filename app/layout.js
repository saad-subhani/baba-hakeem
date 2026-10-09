import './globals.css';
import '../components/SitePolish.global.css';
import '../components/MobileResponsive.global.css';
import SitePolish from '../components/SitePolish';

export const metadata = {
  title: 'Baba Hakeem Herbal Products',
  description: 'Baba Hakeem Herbal Products — herbal oils, traditional blends and premium saffron.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}<SitePolish/></body>
    </html>
  );
}
