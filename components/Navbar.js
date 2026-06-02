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
    { href: '/leaderboard', label: 'Leaderboard' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-black text-white tracking-widest uppercase">
          HEM<span className="text-yellow-600">BIBLE</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-8 items-center">
          {links.map(l => (
            <Link key={l.href} href={l.href} 
                  className={`text-sm font-bold tracking-widest transition ${router.pathname === l.href ? 'text-yellow-500' : 'text-slate-400 hover:text-white'}`}>
              {l.label.toUpperCase()}
            </Link>
          ))}
        </div>

        {/* Mobile Hamburger */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-white text-2xl">
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden bg-[#0c0c0c] border-b border-slate-800 p-6 flex flex-col gap-6">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                  className={`text-lg font-bold ${router.pathname === l.href ? 'text-yellow-500' : 'text-white'}`}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}