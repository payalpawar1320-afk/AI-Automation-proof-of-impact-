import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Proof of Impact | ImpactLoop AI - Verified Resolution Platform',
  description: 'Closed-loop AI-powered accountability platform. Problems are not solved just because marked resolved; Proof of Impact verifies physical resolution and measures true impact.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#080c14] text-slate-100 antialiased min-h-screen selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
