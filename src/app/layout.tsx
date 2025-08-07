import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Club Finance Pilot - Sistema de Análise Financeira',
  description: 'Sistema completo de análise financeira para clubes de futebol com projeções, viabilidade e KPIs.',
  keywords: ['futebol', 'finanças', 'análise', 'viabilidade', 'investimento', 'clube'],
  authors: [{ name: 'Club Finance Pilot Team' }],
  creator: 'Club Finance Pilot',
  publisher: 'Club Finance Pilot',
  metadataBase: new URL('https://club-finance-pilot.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://club-finance-pilot.vercel.app',
    title: 'Club Finance Pilot',
    description: 'Sistema de análise financeira para clubes de futebol',
    siteName: 'Club Finance Pilot',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Club Finance Pilot',
    description: 'Sistema de análise financeira para clubes de futebol',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}