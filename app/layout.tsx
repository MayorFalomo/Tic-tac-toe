import type { Metadata, Viewport } from 'next';
import { Prompt } from 'next/font/google';
import { Pacifico } from 'next/font/google';
import './globals.css';
import StoreProvider from '@/storeProvider';
import Providers from './QueryProvider';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AudioProvider } from '../contexts/AudioContext';
import Head from 'next/head';
import { UserProvider } from '@/contexts/UserContext';

const inter = Prompt({ weight: '400', style: 'normal', subsets: ['latin'] });
const pacifico = Pacifico({
  variable: '--font-pacifico',
  weight: '400',
  style: 'normal',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Online Multiplayer and player chat TicTacToe Game',
  description:
    'A multiplayer TicTacToe game with real-time playing and instant chatting while playing',
  keywords: [
    'TicTacToe',
    'multiplayer',
    'game',
    'online',
    'gaming',
    'Real-time chat',
    'strategy game',
  ],
  generator: 'Next.js',
  manifest: '/manifest.json',
  // themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#000' }],
  authors: [
    {
      name: 'MayorFalomo',
      url: 'https://mayowa-falomo.netlify.app',
    },
  ],
  viewport:
    'minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover',
  icons: [
    {
      rel: 'apple-touch-icon',
      url:
        'https://res.cloudinary.com/dsghy4siv/image/upload/v1737194177/Screenshot_417_xajhrr.png',
    },
    {
      rel: 'icon',
      url:
        'https://res.cloudinary.com/dsghy4siv/image/upload/v1737194177/Screenshot_417_xajhrr.png',
    },
  ],
};

const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

// Exporting this way to avoid NextJs 14 type error
export { viewport };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="" content="Real-time multiplayer TicTacToe  game" />
        <meta property="og:title" content="Next.js" />
        <meta
          property="og:description"
          content="A multiplayer TicTacToe game with real-time playing and instant chatting while playing"
        />
        <meta property="og:url" content="https://realtime-tictactoe.netlify.app" />
        <meta property="og:site_name" content="Online Multiplayer TicTacTToe" />
        <meta
          property="og:image"
          content="https://res.cloudinary.com/dsghy4siv/image/upload/v1737194193/Screenshot_415_pob0xs.png"
        />
        <meta
          property="og:image:type"
          content="https://res.cloudinary.com/dsghy4siv/image/upload/v1737194193/Screenshot_415_pob0xs.png"
        />
        <meta property="og:image:alt" content="Online Multiplayer TicTacToe" />
      </Head>
      <body className={`${inter.className} ${pacifico.variable}`}>
        <StoreProvider>
          <Providers>
            <ThemeProvider>
              <AudioProvider src="/got.mp3">
                <UserProvider>{children}</UserProvider>
              </AudioProvider>
            </ThemeProvider>
          </Providers>
        </StoreProvider>
      </body>
    </html>
  );
}
