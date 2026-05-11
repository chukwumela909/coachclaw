import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const calSans = localFont({
  src: '../fonts/CalSans-SemiBold.woff2',
  variable: '--font-cal',
  weight: '600',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CoachClaw - AI Learning',
  description: 'AI-driven study companion for smarter learning.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={calSans.variable}>
      <body className="antialiased text-[#242424] bg-white selection:bg-[#0099ff] selection:text-white">
        {children}
      </body>
    </html>
  );
}
