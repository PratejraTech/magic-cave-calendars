import { ReactNode } from 'react';

interface RootLayoutProps {
  children: ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender-100 via-sky-100 to-orange-100">
      {children}
    </div>
  );
}