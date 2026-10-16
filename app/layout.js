import './globals.css';
import '../components/SitePolish.global.css';
import '../components/MobileResponsive.global.css';
import '../components/MobileRealDeviceFixes.global.css';
import '../components/PremiumCatalogue.global.css';
import '../components/PremiumCatalogueRefine.global.css';
import '../components/PremiumEffects.global.css';
import '../components/CartExperience.global.css';
import '../components/CommerceCatalogue.global.css';
import '../components/CommerceCatalogueLight.global.css';
import '../components/StickyHeader.global.css';
import '../components/CommerceHoverRestore.global.css';
import '../components/CatalogueHardAlign.global.css';
import '../components/WeddingCourseCardFix.global.css';
import '../components/HeaderLayoutFix.global.css';
import '../components/MensOilHandsLayerFix.global.css';
import '../components/JointOilLayerFix.global.css';
import '../components/ProductTiltEffect.global.css';
import SitePolish from '../components/SitePolish';
import MobileMotionStabilizer from '../components/MobileMotionStabilizer';
import HomeSequentialPages from '../components/HomeSequentialPages';
import CartExperience from '../components/CartExperience';
import ProductTiltEffect from '../components/ProductTiltEffect';

export const metadata = {
  title: 'Baba Hakeem Herbal Products',
  description: 'Baba Hakeem Herbal Products — herbal oils, traditional blends and premium saffron.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}<HomeSequentialPages/><CartExperience/><SitePolish/><MobileMotionStabilizer/><ProductTiltEffect/></body>
    </html>
  );
}
