import type { Metadata } from 'next';
import { Prompt } from 'next/font/google';
import './globals.css';
import StoreProvider from '@/storeProvider';
import Providers from './QueryProvider';
import { ThemeProvider } from './ThemeContext';
import { AudioProvider } from './AudioContext';
const inter = Prompt({ weight: '400', style: 'normal', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Online Multiplayer and player live-chat Tictactoe Game',
  description:
    'A multiplayer Tictactoe game with real-time playing and instant chatting while playing',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>
          <Providers>
            <ThemeProvider>
              <AudioProvider src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3">
                {children}
              </AudioProvider>
            </ThemeProvider>
          </Providers>
        </StoreProvider>
      </body>
    </html>
  );
}
