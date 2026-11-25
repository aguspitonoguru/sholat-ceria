'use client';
import type { LottieProps } from 'lottie-react';
import dynamic from 'next/dynamic';

// Pembungkus opsional lottie-react: dimuat hanya saat dipakai agar bundle tetap ringan.
const Lottie = dynamic(() => import('lottie-react').then((m) => m.Lottie), { ssr: false });

export default function LottiePlayer({ src, className }: { src: LottieProps['src']; className?: string }) {
  return <Lottie src={src} className={className} autoplay loop />;
}
