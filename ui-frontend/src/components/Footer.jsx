'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Footer() {
  const { isAuthenticated, isOrganiser, isAdmin } = useAuth();

  const currentYear = new Date().getFullYear();

  const getQuickLinks = () => {
    if (isAdmin) {
      return [
        { href: '/admin', label: 'Admin Dashboard' },
        { href: '/events', label: 'All Events' },
        { href: '/bookings', label: 'My Bookings' },
      ];
    }
    if (isOrganiser) {
      return [
        { href: '/organiser', label: 'Organiser Dashboard' },
        { href: '/organiser/events', label: 'Manage Events' },
        { href: '/events', label: 'Browse Events' },
      ];
    }
    return [
      { href: '/events', label: 'Discover Events' },
      { href: '/bookings', label: 'My Bookings' },
      { href: '/waitlist', label: 'My Waitlist' },
    ];
  };

  const platformLinks = [
    { href: '/events', label: 'Browse Events' },
    { href: '/register', label: 'Create Account' },
    { href: '/login', label: 'Sign In' },
  ];

  return (
    <footer className="footer" id="site-footer">
      <div className="footer-glow" aria-hidden="true" />
      <div className="footer-inner">
        {/* Brand Column */}
        <div className="footer-col footer-brand-col">
          <Link href="/" className="footer-brand">
            ⚡ ReserveX
          </Link>
          <p className="footer-tagline">
            Premium ticket booking for movies, concerts, sports & more. 
            Real-time seat selection with instant QR code tickets.
          </p>
          <div className="footer-socials">
            <a href="#" className="footer-social-link" aria-label="Twitter / X" title="Twitter / X">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="#" className="footer-social-link" aria-label="Instagram" title="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
            <a href="#" className="footer-social-link" aria-label="YouTube" title="YouTube">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a href="#" className="footer-social-link" aria-label="LinkedIn" title="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="footer-col">
          <h4 className="footer-col-title">Quick Links</h4>
          <ul className="footer-links">
            {getQuickLinks().map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Platform Column */}
        <div className="footer-col">
          <h4 className="footer-col-title">Platform</h4>
          <ul className="footer-links">
            {!isAuthenticated && platformLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
            <li><a href="#">About Us</a></li>
            <li><a href="#">Help & Support</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div className="footer-col footer-newsletter-col">
          <h4 className="footer-col-title">Stay Updated</h4>
          <p className="footer-newsletter-desc">
            Get notified about trending events and exclusive offers.
          </p>
          <form className="footer-newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="your@email.com"
              className="footer-newsletter-input"
              aria-label="Email for newsletter"
            />
            <button type="submit" className="footer-newsletter-btn" aria-label="Subscribe">
              →
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p className="footer-copyright">
            © {currentYear} ReserveX. All rights reserved.
          </p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <span className="footer-dot">·</span>
            <a href="#">Terms of Service</a>
            <span className="footer-dot">·</span>
            <a href="#">Cookie Policy</a>
          </div>
          <p className="footer-made-with">
            Made with <span className="footer-heart">♥</span> & ⚡
          </p>
        </div>
      </div>
    </footer>
  );
}
