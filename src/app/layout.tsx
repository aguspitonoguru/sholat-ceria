import type { Metadata, Viewport } from 'next';
import { Amiri, Fredoka, Nunito } from 'next/font/google';
import Navbar from '@/components/Navbar';
import SceneBackground from '@/components/SceneBackground';
import { AppProvider } from '@/lib/store';
import './globals.css';

const fredoka = Fredoka({ variable: '--font-fredoka', subsets: ['latin'], weight: ['400', '500', '600', '700'] });
const nunito = Nunito({ variable: '--font-nunito', subsets: ['latin'] });
const amiri = Amiri({ variable: '--font-amiri', subsets: ['arabic'], weight: ['400', '700'] });

export const metadata: Metadata = {
  title: 'Sholat Ceria – Belajar Sholat Interaktif',
  description: 'Belajar gerakan dan bacaan sholat bersama Ali & Aisyah.',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#10b981' };

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="id" className={`${fredoka.variable} ${nunito.variable} ${amiri.variable} antialiased`}>
      <body className="font-sans">
        <AppProvider>
          <div className="relative flex h-dvh flex-col overflow-hidden">
            <SceneBackground />
            <Navbar />
            <main className="relative flex min-h-0 flex-1 flex-col">{children}</main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
