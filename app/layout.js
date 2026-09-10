import { Newsreader, Public_Sans } from 'next/font/google';
import './globals.css';

// Newsreader: editorial serif with warmth — carries the civic register without
// feeling like a law firm. Public Sans: the USWDS text face, built for
// legibility at the sizes this audience needs.
const serif = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-serif',
});

const sans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata = {
  title: 'Apopka Senior Council for Good Governance',
  description:
    'A volunteer-led community organization helping Apopka residents understand local government, public policy, and civic responsibility.',
};

export const viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
