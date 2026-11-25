// Efek suara ringan via Web Audio API (tanpa file). Semua dibungkus try agar aman di browser lama.
let ctx: AudioContext | null = null;
let muted = false;
export const setMuted = (m: boolean) => { muted = m; if (m) window.speechSynthesis?.cancel(); };

function ac() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(f: number, at: number, dur: number, opt: { type?: OscillatorType; vol?: number; to?: number } = {}) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + at;
  const o = c.createOscillator(), g = c.createGain();
  o.type = opt.type ?? 'sine';
  o.frequency.setValueAtTime(f, t);
  if (opt.to) o.frequency.exponentialRampToValueAtTime(opt.to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(opt.vol ?? 0.15, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}
// lonceng: nada dasar + oktaf lembut
const bell = (f: number, at: number, dur = 0.45, vol = 0.12) => {
  tone(f, at, dur, { vol });
  tone(f * 2, at, dur * 0.6, { vol: vol * 0.35 });
};

export type Sfx = 'click' | 'slide' | 'pop' | 'jump' | 'correct' | 'wrong' | 'fanfare' | 'star';
export function play(s: Sfx) {
  if (muted) return;
  try {
    switch (s) {
      case 'click': tone(620, 0, 0.09, { to: 900, vol: 0.1 }); break;
      case 'slide': tone(380, 0, 0.12, { type: 'triangle', to: 560, vol: 0.07 }); break;
      case 'pop': tone(500, 0, 0.08, { to: 1100, vol: 0.12 }); break;
      case 'jump': tone(300, 0, 0.28, { type: 'triangle', to: 820, vol: 0.13 }); bell(1318, 0.18, 0.3, 0.06); break;
      case 'correct': [784, 988, 1175, 1568].forEach((f, i) => bell(f, i * 0.08, 0.4)); break;
      case 'wrong': tone(392, 0, 0.18, { type: 'triangle', vol: 0.1 }); tone(330, 0.16, 0.26, { type: 'triangle', vol: 0.1 }); break;
      case 'star': [1318, 1760, 2093].forEach((f, i) => bell(f, i * 0.06, 0.35, 0.08)); break;
      case 'fanfare': [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => bell(f, i * 0.11, 0.5, 0.11)); break;
    }
  } catch {}
}

// ---------- suara pembaca otomatis sesuai gender ----------
export type Speaker = 'ali' | 'aisyah';
// Nama suara bawaan Windows/Edge/Chrome/Android/iOS yang dikenal laki-laki atau perempuan.
const MALE = /hamed|shakir|naayf|fahed|hamdan|omar|taim|rami|bassel|moaz|jamal|abdullah|majed|tarik|maged|ardi|andika|\bmale\b|laki/i;
const FEMALE = /hoda|zariyah|salma|amany|laila|layla|sana|fatima|mouna|iman|rana|noura|aysha|amina|hala|zainab|maryam|gadis|damayanti|\bfemale\b|perempuan|google/i;

/** Pilih suara paling alami (Natural/Online/Neural) dengan gender yang cocok untuk bahasa `lang` ('ar' | 'id'). */
export function pickVoice(lang: string, who: Speaker) {
  const vs = window.speechSynthesis?.getVoices().filter((v) => v.lang.toLowerCase().startsWith(lang)) ?? [];
  const [want, avoid] = who === 'ali' ? [MALE, FEMALE] : [FEMALE, MALE];
  const score = (v: SpeechSynthesisVoice) =>
    (want.test(v.name) ? 4 : avoid.test(v.name) ? -4 : 0) + (/natural|online|neural|premium|enhanced/i.test(v.name) ? 3 : 0);
  const best = vs.sort((a, b) => score(b) - score(a))[0];
  return best && { voice: best, genderOk: !avoid.test(best.name) };
}

/** Utterance dengan nada anak yang wajar (tidak dicempreng-kan) */
export function utter(text: string, lang: 'ar' | 'id', who: Speaker) {
  const u = new SpeechSynthesisUtterance(text);
  const p = pickVoice(lang, who);
  if (p) { u.voice = p.voice; u.lang = p.voice.lang; } else u.lang = lang === 'ar' ? 'ar-SA' : 'id-ID';
  // suara dewasa dinaikkan sedikit agar terdengar seperti anak; bila gender tidak cocok, geser nadanya
  u.pitch = who === 'aisyah' ? 1.15 : p && !p.genderOk ? 0.85 : 1.05;
  u.rate = lang === 'ar' ? 0.8 : 0.95;
  return u;
}

// Ali/Aisyah "berbicara" bahasa Indonesia dengan suara sesuai gendernya.
export function say(text: string, who: Speaker) {
  if (muted || typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter(text, 'id', who));
}
