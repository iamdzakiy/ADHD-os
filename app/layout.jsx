import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import Layout from '@/components/Layout';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: 'ADHD OS - Life Management System',
  description: 'Unified finance, calendar, second brain, and vault.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <Layout>{children}</Layout>
        </AuthProvider>
      </body>
    </html>
  );
}