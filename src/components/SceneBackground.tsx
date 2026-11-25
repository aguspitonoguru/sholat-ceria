'use client';
import { motion } from 'framer-motion';

const Cloud = ({ y, scale, dur, delay }: { y: string; scale: number; dur: number; delay: number }) => (
  <motion.svg
    viewBox="0 0 120 50"
    className="absolute w-40"
    style={{ top: y, scale }}
    initial={{ x: '-20vw' }}
    animate={{ x: '110vw' }}
    transition={{ duration: dur, delay, repeat: Infinity, ease: 'linear' }}
  >
    <path d="M18 42a14 14 0 0 1 4-27 20 20 0 0 1 37-6 16 16 0 0 1 29 4 14 14 0 0 1 14 29z" fill="#fff" opacity="0.92" />
  </motion.svg>
);

// Latar buku cerita: langit, matahari tersenyum, awan, bukit, siluet masjid.
export default function SceneBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-gradient-to-b from-[#e0f2fe] via-[#f0f9ff] to-[#fffbeb]">
      <motion.svg viewBox="0 0 100 100" className="absolute right-[6%] top-[11%] w-20 sm:w-28" animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}>
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x="48" y="2" width="4" height="13" rx="2" fill="#fbbf24" transform={`rotate(${i * 30} 50 50)`} />
        ))}
      </motion.svg>
      <motion.svg viewBox="0 0 100 100" className="absolute right-[6%] top-[11%] w-20 sm:w-28" animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 3, repeat: Infinity }}>
        <circle cx="50" cy="50" r="27" fill="#fcd34d" stroke="#f59e0b" strokeWidth="2" />
        <circle cx="41" cy="46" r="2.6" fill="#78350f" />
        <circle cx="59" cy="46" r="2.6" fill="#78350f" />
        <circle cx="36" cy="55" r="3.5" fill="#fb923c" opacity="0.5" />
        <circle cx="64" cy="55" r="3.5" fill="#fb923c" opacity="0.5" />
        <path d="M42 57q8 7 16 0" stroke="#78350f" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </motion.svg>
      <Cloud y="14%" scale={1} dur={70} delay={-20} />
      <Cloud y="26%" scale={0.7} dur={90} delay={-55} />
      <Cloud y="8%" scale={0.55} dur={110} delay={-80} />
      <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="absolute bottom-0 h-[38%] w-full">
        <g fill="#bbf7d0" opacity="0.9">
          <rect x="1010" y="120" width="150" height="90" />
          <path d="M1085 40c-45 15-60 50-60 80h120c0-30-15-65-60-80z" />
          <rect x="980" y="60" width="16" height="150" />
          <path d="M988 30l-12 30h24z" />
          <rect x="1176" y="60" width="16" height="150" />
          <path d="M1184 30l-12 30h24z" />
          <path d="M1081 22h8v18h-8z" />
        </g>
        <path d="M0 210C240 140 420 150 640 200s420 60 800-40v160H0z" fill="#a7f3d0" />
        <path d="M0 260c300-60 520-40 760 0s460 20 680-30v90H0z" fill="#6ee7b7" />
      </svg>
    </div>
  );
}
