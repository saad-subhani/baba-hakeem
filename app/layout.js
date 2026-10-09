import './globals.css';
import '../components/SitePolish.global.css';
import '../components/MobileResponsive.global.css';
import '../components/MobileRealDeviceFixes.global.css';
import SitePolish from '../components/SitePolish';
import MobileMotionStabilizer from '../components/MobileMotionStabilizer';

export const metadata = {
  title: 'Baba Hakeem Herbal Products',
  description: 'Baba Hakeem Herbal Products — herbal oils, traditional blends and premium saffron.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}<SitePolish/><MobileMotionStabilizer/></body>
    </html>
  );
}
