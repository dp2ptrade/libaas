import './globals.css';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Providers } from '@/components/providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The Libaas Gallery — Couture & Pret Clothing',
  description:
    'The Libaas Gallery — where heritage meets modern elegance. Discover couture formal wear, luxury pret, unstitched lawn, sarees, and menswear crafted with artisanal detail.',
  keywords: ['libaas', 'clothing', 'couture', 'luxury pret', 'saree', 'sherwani', 'lawn', 'Bangladesh fashion'],
  openGraph: {
    title: 'The Libaas Gallery — Couture & Pret Clothing',
    description: 'Where heritage meets modern elegance. Shop couture, luxury pret, unstitched lawn, sarees and menswear.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
