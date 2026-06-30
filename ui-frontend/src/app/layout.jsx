import '@/styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';

export const metadata = {
  title: 'ReserveX - Premium Ticket Booking',
  description: 'Book tickets for movies, concerts, and events with real-time seat selection, QR code tickets, and waitlist management.',
  keywords: 'ticket booking, events, movies, concerts, seat selection, QR code tickets',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            const theme = localStorage.getItem('theme') || 'dark';
            if (theme === 'light') {
              document.body.classList.add('light-theme');
            }
          })()
        ` }} />
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <ScrollToTop />
        </AuthProvider>
      </body>
    </html>
  );
}
