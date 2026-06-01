import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/bible', label: 'Bible' },
    { href: '/quiz', label: 'Quiz' },
    { href: '/admin', label: 'Admin' },
  ];

  return (
    <nav style={{
      background: 'rgba(13,27,62,0.95)',
      borderBottom: '1px solid rgba(201,168,76,0.25)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: '1.1rem', color: '#c9a84c', letterSpacing: '0.12em', fontWeight: 700 }}>
            ✦ SACRED WORD
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="desktop-nav" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} style={{ textDecoration: 'none' }}>
              <span className={`nav-link${router.pathname === l.href || (l.href !== '/' && router.pathname.startsWith(l.href)) ? ' active' : ''}`}>
                {l.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="mobile-menu-btn"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c9a84c', fontSize: '1.5rem', display: 'none' }}
          aria-label="Menu"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="mobile-dropdown" style={{ borderTop: '1px solid rgba(201,168,76,0.15)', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} style={{ textDecoration: 'none' }}>
              <span className={`nav-link${router.pathname === l.href ? ' active' : ''}`} style={{ fontSize: '1rem' }}>
                {l.label}
              </span>
            </Link>
          ))}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
