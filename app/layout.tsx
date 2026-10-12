import type { Metadata } from 'next';
import '@/styles/globals.scss';
import CustomCursor from '@/components/CustomCursor/CustomCursor';

export const metadata: Metadata = {
  title: 'Nove Graphics',
  description: 'Graphic design for the underground. Athens, GR.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="dark">
      <body suppressHydrationWarning>
        {children}
        <CustomCursor />
      </body>
    </html>
  );
}
