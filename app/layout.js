import './globals.css';
import '../components/SitePolish.global.css';
import '../components/MobileResponsive.global.css';
import '../components/MobileRealDeviceFixes.global.css';
import '../components/PremiumCatalogue.global.css';
import '../components/PremiumCatalogueRefine.global.css';
import '../components/ZafranCatalogueFix.global.css';
import '../components/PremiumEffects.global.css';
import SitePolish from '../components/SitePolish';
import MobileMotionStabilizer from '../components/MobileMotionStabilizer';
import HomeSequentialPages from '../components/HomeSequentialPages';

export const metadata = {
  title: 'Baba Hakeem Herbal Products',
  description: 'Baba Hakeem Herbal Products — herbal oils, traditional blends and premium saffron.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}<HomeSequentialPages/><SitePolish/><MobileMotionStabilizer/></body>
    </html>
  );
}
