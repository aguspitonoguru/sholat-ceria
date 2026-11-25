'use client';
import { motion } from 'framer-motion';
import { Square, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Material } from '@/data/sholatData';
import { getRecording } from '@/lib/recordings';
import { type Speaker, pickVoice, utter } from '@/lib/sound';

type Source = 'rekaman' | 'mp3' | 'otomatis' | 'latin';
const LABEL: Record<Source, string> = { rekaman: 'Rekaman suara guru', mp3: 'Rekaman bacaan', otomatis: 'Suara pembaca otomatis', latin: 'Membaca teks latin' };

// Urutan sumber suara (paling alami dulu):
// 1) rekaman guru di Mode Guru  2) URL mp3 dari guru  3) file public/audio/ali/{slug}.mp3 (dipakai Ali & Aisyah)  4) suara otomatis sesuai gender
export default function AudioPlayer({ material, character }: { material: Material; character: Speaker }) {
  const [playing, setPlaying] = useState(false);
  const [source, setSource] = useState<Source | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const token = useRef(0);
  const blobUrl = useRef<string | null>(null);

  const stop = () => {
    token.current++;
    audio.current?.pause();
    window.speechSynthesis?.cancel();
    setPlaying(false);
  };
  useEffect(() => {
    window.speechSynthesis?.getVoices(); // memicu pemuatan daftar suara
    return () => { stop(); if (blobUrl.current) URL.revokeObjectURL(blobUrl.current); };
  }, []);
  useEffect(() => stop, [material, character]);

  const speak = (my: number) => {
    const synth = window.speechSynthesis;
    if (!synth || token.current !== my) return setPlaying(false);
    const arabic = !!pickVoice('ar', character);
    const u = utter(arabic ? material.arabic.replace(/۝/g, '،') : material.latin, arabic ? 'ar' : 'id', character);
    setSource(arabic ? 'otomatis' : 'latin');
    u.onend = u.onerror = () => { if (token.current === my) setPlaying(false); };
    synth.cancel();
    synth.speak(u);
  };

  // Putar daftar URL berurutan; bila satu gagal, lanjut ke cadangan.
  const playUrls = (urls: string[], my: number, onFail: () => void) => {
    const a = (audio.current ??= new Audio());
    let i = 0;
    const next = () => {
      if (token.current !== my) return;
      if (i >= urls.length) return setPlaying(false);
      a.src = urls[i++];
      a.play().catch(fail);
    };
    const fail = () => { if (token.current === my) { a.onended = a.onerror = null; onFail(); } };
    a.onended = next;
    a.onerror = fail;
    next();
  };

  const start = async () => {
    stop();
    const my = ++token.current;
    setPlaying(true);
    if (material.tts) return speak(my);
    const rec = await getRecording(`${character}/${material.slug}`);
    if (token.current !== my) return;
    const local = `/audio/ali/${material.slug}.mp3`; // Ali & Aisyah memakai rekaman bacaan yang sama
    const fallbackFile = () => { setSource('mp3'); playUrls([local], my, () => speak(my)); };
    if (rec) {
      if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
      blobUrl.current = URL.createObjectURL(rec);
      setSource('rekaman');
      return playUrls([blobUrl.current], my, fallbackFile);
    }
    const urls = (character === 'ali' ? material.audioAli : material.audioAisyah).split(/\s+/).filter(Boolean);
    if (urls.length) { setSource('mp3'); return playUrls(urls, my, fallbackFile); }
    fallbackFile();
  };

  return (
    <div className="flex items-center gap-3">
      <button onClick={playing ? stop : start} aria-label={playing ? 'Berhenti' : 'Dengarkan Bacaan'} title={playing ? 'Berhenti' : 'Dengarkan Bacaan'} className={`btn-3d shrink-0 px-4 py-2.5 text-white ${playing ? 'border-rose-700 bg-rose-500' : 'border-sky-700 bg-sky-500'}`}>
        {playing ? <Square className="h-5 w-5 fill-white" /> : <Volume2 className="h-5 w-5" />}
        <span className="hidden sm:inline">{playing ? 'Berhenti' : 'Dengarkan'}</span>
      </button>
      <div className="flex h-8 items-center gap-1" aria-hidden>
        {[0.5, 0.9, 0.6, 1, 0.7, 0.85, 0.45].map((h, i) => (
          <motion.span
            key={i}
            className="w-1.5 rounded-full bg-sky-400"
            animate={playing ? { height: ['20%', `${h * 100}%`, '30%', `${h * 80}%`, '20%'] } : { height: '20%' }}
            transition={playing ? { duration: 0.9 + i * 0.07, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
          />
        ))}
      </div>
      {playing && source && <span className="text-xs leading-tight text-slate-500">{LABEL[source]}</span>}
    </div>
  );
}
