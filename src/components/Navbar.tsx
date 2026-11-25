'use client';
import { motion } from 'framer-motion';
import { BookOpen, Gamepad2, Home, Star, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';
import { play } from '@/lib/sound';

export function Logo({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect width="48" height="48" rx="14" fill="#10b981" />
      <path d="M24 12c-7 3-10 8-10 13h20c0-5-3-10-10-13z" fill="#fff" />
      <rect x="14" y="25" width="20" height="12" fill="#fff" />
      <path d="M21 37v-6a3 3 0 0 1 6 0v6z" fill="#10b981" />
      <rect x="9" y="18" width="3.5" height="19" rx="1" fill="#fde68a" />
      <rect x="35.5" y="18" width="3.5" height="19" rx="1" fill="#fde68a" />
      <path d="M36 4l1.8 3.7 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6z" fill="#fbbf24" />
    </svg>
  );
}

const LINKS = [
  { href: '/', label: 'Beranda', icon: Home },
  { href: '/belajar', label: 'Belajar Sholat', icon: BookOpen },
  { href: '/kuis', label: 'Kuis Seru', icon: Gamepad2 },
];

export default function Navbar() {
  const path = usePathname();
  const { stars, muted, update } = useApp();
  return (
    <header className="relative z-30 px-2 pt-2 sm:px-4 sm:pt-3">
      <nav className="mx-auto flex max-w-7xl items-center gap-2 rounded-3xl bg-white/85 px-2 py-1.5 shadow-lg shadow-sky-200/60 ring-1 ring-white backdrop-blur sm:px-3">
        <Link href="/" className="flex shrink-0 items-center gap-2" onClick={() => play('click')}>
          <motion.span whileHover={{ rotate: -8, scale: 1.08 }}><Logo className="h-9 w-9 sm:h-10 sm:w-10" /></motion.span>
          <span className="hidden font-display text-xl font-bold text-emerald-600 md:block">
            Sholat <span className="text-amber-500">Ceria</span>
          </span>
        </Link>
        <div className="mx-auto flex gap-1">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? path === '/' : path.startsWith(href);
            return (
              <Link key={href} href={href} onClick={() => play('click')} className={`relative flex items-center gap-1.5 rounded-2xl px-2.5 py-2 font-display text-sm font-semibold transition-colors sm:px-4 sm:text-base ${active ? 'text-white' : 'text-emerald-700 hover:bg-emerald-50'}`}>
                {active && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-2xl bg-emerald-500 shadow-md" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                <Icon className="relative h-5 w-5" />
                <span className="relative hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <motion.div key={stars} initial={{ scale: 1.35 }} animate={{ scale: 1 }} className="flex items-center gap-1 rounded-2xl bg-amber-100 px-2.5 py-1.5 font-display font-bold text-amber-600 ring-1 ring-amber-200" title="Bintangku">
            <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
            {stars}
          </motion.div>
          <button onClick={() => { update({ muted: !muted }); if (muted) setTimeout(() => play('pop'), 30); }} className="rounded-2xl bg-sky-100 p-2 text-sky-600 ring-1 ring-sky-200 hover:bg-sky-200" aria-label={muted ? 'Nyalakan suara' : 'Matikan suara'} title={muted ? 'Nyalakan suara' : 'Matikan suara'}>
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </div>
      </nav>
    </header>
  );
}
