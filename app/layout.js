import './globals.css';

export const metadata = {
  title: 'Verdura Botanics',
  description: 'Immersive herbal skincare e-commerce demo'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}