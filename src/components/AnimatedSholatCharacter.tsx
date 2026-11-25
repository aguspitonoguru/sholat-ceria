'use client';
import { animate, motion, useAnimationControls } from 'framer-motion';
import { type ReactNode, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import {
  type Pose, type Seq, type Skeleton, type V3, type View,
  BODY, SEQUENCES, add, blendPose, facing, finalPose, mul, norm, project, solve,
} from '@/lib/rig';

export type CharacterName = 'ali' | 'aisyah';
const INK = '#4a3426';
const LOOK = {
  ali: { skin: '#f5c6a0', top: '#f8fafc', topDark: '#cbd5e1', bottom: '#15803d', hair: '#3b2a20', sole: '#fbd9c4' },
  aisyah: { skin: '#f8cfae', top: '#ffffff', topDark: '#cbd5e1', bottom: '#f8fafc', hair: '#ffffff', sole: '#fde2d0' },
};

// ---------- animasi pose ----------
function usePose(seq: Seq, replayKey: number, still: boolean, loop: boolean) {
  const keys = SEQUENCES[seq];
  const [pose, setPose] = useState<Pose>(() => keys[0].pose);
  const cur = useRef(pose);
  useEffect(() => {
    if (still) return;
    let alive = true;
    let ctrl: { stop: () => void } | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const wait = (ms: number) => new Promise<void>((r) => { timer = setTimeout(r, ms); });
    const tween = (to: Pose, dur: number) =>
      new Promise<void>((r) => {
        const from = cur.current;
        ctrl = animate(0, 1, {
          duration: dur,
          ease: 'linear', // easing per bagian tubuh diatur blendPose
          onUpdate: (u) => { cur.current = blendPose(from, to, u); setPose(cur.current); },
          onComplete: r,
        });
      });
    (async () => {
      do {
        for (const k of keys) {
          await tween(k.pose, k.dur ?? 1.05);
          if (!alive) return;
          if (k.hold) await wait(k.hold);
          if (!alive) return;
        }
        if (loop && keys.length > 1) await wait(2200);
      } while (alive && loop && keys.length > 1);
    })();
    return () => { alive = false; ctrl?.stop(); clearTimeout(timer); };
  }, [keys, replayKey, still, loop]);
  return still ? finalPose(seq) : pose;
}

function useBlink(enabled: boolean) {
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => { setBlink(true); t = setTimeout(() => { setBlink(false); loop(); }, 140); }, 2200 + Math.random() * 2600);
    };
    loop();
    return () => clearTimeout(t);
  }, [enabled]);
  return blink;
}

// ---------- geometri 2D ----------
type P2 = [number, number];
function hull(pts: P2[]): P2[] {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: P2, a: P2, b: P2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: P2[] = [], up: P2[] = [];
  for (const q of p) { while (lo.length > 1 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (up.length > 1 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
// titik-titik bola kecil di sekitar c; tidak pernah menembus lantai (y >= 0.6)
const expand = (c: V3, r: number): V3[] =>
  ([[r, 0, 0], [-r, 0, 0], [0, r, 0], [0, -r, 0], [0, 0, r], [0, 0, -r]] as V3[]).map((o) => {
    const p = add(c, o);
    return [p[0], Math.max(p[1], 0.6), p[2]];
  });
function ring(c: V3, a: V3, b: V3, r: number, n = 12): V3[] {
  return Array.from({ length: n }, (_, i) => {
    const t = (i / n) * Math.PI * 2;
    return add(c, add(mul(a, Math.cos(t) * r), mul(b, Math.sin(t) * r)));
  });
}

const r2 = (x: number) => Math.round(x * 100) / 100;
// Kurva tertutup halus (Catmull-Rom -> Bezier) lewat titik-titik hull, agar kain & badan tidak bersudut.
function smooth(pts: P2[]): string {
  const p = pts.filter((q, i) => { const n = pts[(i + 1) % pts.length]; return Math.hypot(q[0] - n[0], q[1] - n[1]) > 1.2; });
  const n = p.length;
  if (n < 3) return '';
  let d = `M${r2(p[0][0])},${r2(p[0][1])}`;
  for (let i = 0; i < n; i++) {
    const a = p[(i - 1 + n) % n], b = p[i], c = p[(i + 1) % n], e = p[(i + 2) % n];
    d += ` C${r2(b[0] + (c[0] - a[0]) / 6)},${r2(b[1] + (c[1] - a[1]) / 6)} ${r2(c[0] - (e[0] - b[0]) / 6)},${r2(c[1] - (e[1] - b[1]) / 6)} ${r2(c[0])},${r2(c[1])}`;
  }
  return d + 'Z';
}

type Item = { d: number; el: ReactNode };

function buildBody(sk: Skeleton, view: View, who: CharacterName, blink: boolean, calm: boolean, uid: string): Item[] {
  const L = LOOK[who];
  const items: Item[] = [];
  const pr = (p: V3) => project(p, view);
  const depth = (pts: V3[]) => pts.reduce((s, p) => s + pr(p)[2], 0) / pts.length;
  let k = 0;
  const capsule = (a: V3, b: V3, r: number, color: string, bias = 0, ink = INK) => {
    const [ax, ay] = pr(a), [bx, by] = pr(b);
    items.push({
      d: depth([a, b]) + bias,
      el: (
        <g key={k++} strokeLinecap="round">
          <line x1={ax} y1={ay} x2={bx} y2={by} stroke={ink} strokeWidth={r * 2 + 2.4} />
          <line x1={ax} y1={ay} x2={bx} y2={by} stroke={color} strokeWidth={r * 2} />
        </g>
      ),
    });
  };
  const blob = (pts: V3[], round: number, fill: string, bias = 0, extra?: ReactNode) => {
    const h = smooth(hull(pts.map((p) => pr(p).slice(0, 2) as P2)));
    items.push({
      d: depth(pts) + bias,
      el: (
        <g key={k++} strokeLinejoin="round">
          <path d={h} fill={INK} stroke={INK} strokeWidth={round * 2 + 2.4} />
          <path d={h} fill={fill} stroke={fill === `url(#${uid}-plaid)` ? L.bottom : fill} strokeWidth={round * 2} />
          {extra}
        </g>
      ),
    });
  };

  const { up, fwd, pelvis, chest, neck } = sk;
  const X: V3 = [1, 0, 0];

  // --- bawahan: sarung (Ali) / rok mukena (Aisyah)
  const ali = who === 'ali';
  const skirt = [
    ...expand(sk.hipL, ali ? 7 : 8), ...expand(sk.hipR, ali ? 7 : 8), ...expand(sk.kneeL, ali ? 6.5 : 8), ...expand(sk.kneeR, ali ? 6.5 : 8),
    ...expand(sk.ankleL, ali ? 3.5 : 6), ...expand(sk.ankleR, ali ? 3.5 : 6),
  ];
  // rok mukena mengembang seperti lonceng di dekat lantai
  if (!ali) for (const a of [sk.ankleL, sk.ankleR]) skirt.push(...expand([a[0], 0.6, a[2]], 9).filter((q) => q[1] < 2));
  blob(skirt, 1.6, ali ? `url(#${uid}-plaid)` : L.bottom, -1.5);
  // --- telapak kaki (dari belakang tampak telapak/sol)
  const footColor = view === 'back' ? L.sole : L.skin;
  capsule(sk.ankleL, sk.toeL, 3, footColor, 0.5);
  capsule(sk.ankleR, sk.toeR, 3, footColor, 0.5);

  // --- badan
  if (who === 'ali') {
    const bot = add(pelvis, mul(up, -4)), top = add(chest, mul(up, 2));
    const box: V3[] = [];
    for (const [c, w] of [[bot, 9.5], [top, 10.5]] as [V3, number][])
      for (const sx of [-1, 1]) for (const sf of [-1, 1]) box.push(add(add(c, mul(X, sx * w)), mul(fwd, sf * 5)));
    const torsoD = depth([pelvis, chest]);
    const showFront = facing(fwd, view) > 0.25;
    let extra: ReactNode = null;
    if (showFront) {
      const a = pr(add(add(neck, mul(up, -1.5)), mul(fwd, 5.4)));
      const b = pr(add(add(pelvis, mul(up, 8)), mul(fwd, 5.4)));
      extra = (
        <g>
          <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={L.topDark} strokeWidth={1.4} />
          {[0.15, 0.4, 0.65].map((t) => (
            <circle key={t} cx={a[0] + (b[0] - a[0]) * t} cy={a[1] + (b[1] - a[1]) * t} r={1.3} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={0.5} />
          ))}
        </g>
      );
    }
    blob(box, 2.2, L.top, 0, extra);
    items[items.length - 1].d = torsoD;
    capsule(add(neck, mul(up, -1)), add(neck, mul(sk.headUp, 3)), 3.4, L.skin, 0.2);
  } else {
    // Mukena satu potong dari kepala sampai paha, ikut menutup lengan (tangan hanya mengintip).
    const hood = BODY.headR + 3.4;
    const cape: V3[] = [
      ...ring(sk.headC, sk.headRight, sk.face, hood, 16),
      add(sk.headC, mul(sk.headUp, hood)), add(sk.headC, mul(sk.headUp, -hood)),
      ...expand(sk.shL, 6.5), ...expand(sk.shR, 6.5), ...expand(sk.elL, 6), ...expand(sk.elR, 6),
      ...expand(sk.wrL, 5), ...expand(sk.wrR, 5),
      ...expand(add(add(pelvis, mul(up, -3)), mul(X, 14.5)), 6.5), ...expand(add(add(pelvis, mul(up, -3)), mul(X, -14.5)), 6.5),
    ];
    blob(cape, 1.6, L.top, 0);
    items[items.length - 1].d = depth([pelvis, chest]);
  }

  // --- lengan
  // Ali: lengan baju koko. Aisyah: lengan di dalam mukena, hanya garis lipatan lembut.
  const ua = ali ? 3.6 : 4.4, fa = ali ? 3.3 : 4.2, fold = ali ? INK : '#e2e8f0';
  for (const [sh, el, wr, tip] of [[sk.shL, sk.elL, sk.wrL, sk.tipL], [sk.shR, sk.elR, sk.wrR, sk.tipR]] as V3[][]) {
    capsule(sh, el, ua, L.top, 0.3, fold);
    capsule(el, wr, fa, L.top, 0.4, fold);
    capsule(wr, tip, 3.1, L.skin, 0.7);
  }
  if (sk.finger > 0.05) capsule(sk.tipR, sk.fingerTip, 1.3, L.skin, 0.9);

  // --- kepala
  const R = BODY.headR;
  const [cx, cy, cd] = pr(sk.headC);
  const dir2 = (v: V3): P2 => { const a = pr(add(sk.headC, v)); return [a[0] - cx, a[1] - cy]; };
  const fFace = facing(sk.face, view);
  const fo = dir2(sk.face), dn = dir2(mul(sk.headUp, -1));
  const pt = (n: V3) => pr(add(sk.headC, mul(norm(n), R * 0.98)));
  const head: ReactNode[] = [];
  const clip = `${uid}-${view}-clip`;

  if (who === 'ali') {
    head.push(<clipPath key="c" id={clip}><circle cx={cx} cy={cy} r={R} /></clipPath>);
    head.push(<circle key="h" cx={cx} cy={cy} r={R} fill={L.hair} stroke={INK} strokeWidth={1.2} />);
    if (fFace > -0.35)
      head.push(<circle key="f" clipPath={`url(#${clip})`} cx={cx + fo[0] * R * 0.3 + dn[0] * R * 0.12} cy={cy + fo[1] * R * 0.3 + dn[1] * R * 0.12} r={R * 0.95} fill={L.skin} />);
    for (const s of [1, -1]) {
      const n = mul(sk.headRight, s);
      if (facing(n, view) > -0.3) {
        const [ex, ey] = pr(add(sk.headC, mul(n, R * 0.95)));
        head.push(<circle key={`e${s}`} cx={ex} cy={ey} r={2.6} fill={L.skin} stroke={INK} strokeWidth={0.9} />);
      }
    }
  } else {
    // garis luar kerudung sudah digambar oleh mukena (satu potong), di sini cukup isi warnanya
    head.push(<clipPath key="c" id={clip}><circle cx={cx} cy={cy} r={R + 3.4} /></clipPath>);
    head.push(<circle key="h" cx={cx} cy={cy} r={R + 3.4} fill={L.top} />);
    if (fFace > -0.35) {
      const fx = cx + fo[0] * R * 0.32 + dn[0] * R * 0.08, fy = cy + fo[1] * R * 0.32 + dn[1] * R * 0.08;
      head.push(
        <g key="f" clipPath={`url(#${clip})`}>
          <ellipse cx={fx} cy={fy} rx={R * 0.76} ry={R * 0.86} fill={L.skin} />
          <ellipse cx={fx} cy={fy} rx={R * 0.8} ry={R * 0.9} fill="none" stroke={L.topDark} strokeWidth={1} />
        </g>,
      );
    }
  }
  // mata, pipi, senyum
  for (const s of [1, -1]) {
    const n = norm(add(add(mul(sk.face, 0.92), mul(sk.headRight, s * 0.36)), mul(sk.headUp, 0.06)));
    const f = facing(n, view);
    if (f > 0.12) {
      const [ex, ey] = pt(n);
      const sq = Math.max(0.45, Math.min(1, f * 1.4));
      head.push(
        calm && !ali ? (
          // Aisyah terpejam tenang saat sholat; Ali tetap membuka mata (sesuai aset referensi)
          <path key={`eye${s}`} d={`M${ex - 1.7 * sq},${ey} Q${ex},${ey + 1.5} ${ex + 1.7 * sq},${ey}`} stroke="#2b1d16" strokeWidth={0.95} fill="none" strokeLinecap="round" />
        ) : (
          <g key={`eye${s}`}>
            <ellipse cx={ex} cy={ey} rx={1.5 * sq} ry={blink ? 0.3 : 2.1} fill="#2b1d16" />
            {!blink && <circle cx={ex + 0.5 * sq} cy={ey - 0.8} r={0.55} fill="#fff" />}
          </g>
        ),
      );
    }
    const c = norm(add(add(mul(sk.face, 0.8), mul(sk.headRight, s * 0.52)), mul(sk.headUp, -0.24)));
    if (facing(c, view) > 0.2) {
      const [px, py] = pt(c);
      head.push(<circle key={`ch${s}`} cx={px} cy={py} r={2.1} fill="#fb7185" opacity={0.45} />);
    }
  }
  if (fFace > 0) {
    const [nx, ny] = pt(add(sk.face, mul(sk.headUp, -0.14)));
    head.push(<ellipse key="nose" cx={nx} cy={ny} rx={1.1} ry={0.9} fill="#e29a72" opacity={0.75} />);
  }
  const m = norm(add(mul(sk.face, 0.93), mul(sk.headUp, -0.36)));
  if (facing(m, view) > 0.15) {
    const a = pt(add(m, mul(sk.headRight, 0.22))), b = pt(add(m, mul(sk.headRight, -0.22))), c = pt(m);
    const qx = c[0] * 2 - (a[0] + b[0]) / 2 + dn[0] * 1.4, qy = c[1] * 2 - (a[1] + b[1]) / 2 + dn[1] * 1.4;
    head.push(<path key="m" d={`M${a[0]},${a[1]} Q${qx},${qy} ${b[0]},${b[1]}`} stroke="#9a3412" strokeWidth={1.2} fill="none" strokeLinecap="round" />);
  }
  if (who === 'ali') {
    // peci
    const b0 = ring(add(sk.headC, mul(sk.headUp, R * 0.5)), sk.headRight, sk.face, R * 0.9);
    const b1 = ring(add(sk.headC, mul(sk.headUp, R * 1.08)), sk.headRight, sk.face, R * 0.78);
    const h = hull([...b0, ...b1].map((p) => pr(p).slice(0, 2) as P2)).map((p) => p.join(',')).join(' ');
    head.push(
      <g key="peci" strokeLinejoin="round">
        <polygon points={h} fill={INK} stroke={INK} strokeWidth={4.4} />
        <polygon points={h} fill="#1f2937" stroke="#1f2937" strokeWidth={2} />
      </g>,
    );
  }
  items.push({ d: cd + 3, el: <g key="head">{head}</g> });
  return items.sort((a, b) => a.d - b.d);
}

// ---------- sajadah & bayangan ----------
function Floor({ sk, view }: { sk: Skeleton; view: View }) {
  const pr = (p: V3) => project(p, view);
  const poly = (pts: V3[]) => pts.map((p) => pr(p).slice(0, 2).join(',')).join(' ');
  const rect = (x: number, z0: number, z1: number): V3[] => [[-x, 0, z0], [x, 0, z0], [x, 0, z1], [-x, 0, z1]];
  const arch: V3[] = Array.from({ length: 17 }, (_, i) => {
    const x = -12 + (24 * i) / 16;
    return [x, 0, 30 + 15 * Math.pow(Math.max(0, 1 - (x / 12) ** 2), 0.7)];
  });
  const fl = [sk.ankleL, sk.ankleR, sk.kneeL, sk.kneeR, sk.wrL, sk.wrR, sk.headC, sk.pelvis].map((p) => pr([p[0], 0, p[2]]));
  const xs = fl.map((p) => p[0]), ys = fl.map((p) => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  return (
    <g>
      <polygon points={poly(rect(22, -35, 51))} fill="#0f766e" stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
      <polygon points={poly(rect(19.5, -32.5, 48.5))} fill="#14b8a6" stroke="#fbbf24" strokeWidth={1.4} />
      <polyline points={poly([[-12, 0, 30], ...arch, [12, 0, 30]])} fill="#0d9488" stroke="#fbbf24" strokeWidth={1.4} strokeLinejoin="round" />
      <ellipse cx={(minX + maxX) / 2} cy={(Math.min(...ys) + Math.max(...ys)) / 2 + 1} rx={(maxX - minX) / 2 + 7} ry={view === 'front' ? 4.5 : 3.5} fill="#000" opacity={0.16} />
    </g>
  );
}

// ---------- satu sudut pandang ----------
type ViewProps = { sk: Skeleton; who: CharacterName; blink: boolean; calm: boolean; jump: ReturnType<typeof useAnimationControls>; still?: boolean; className?: string };

function CharacterSVG({ sk, who, blink, calm, jump, view, still, className }: ViewProps & { view: View }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg viewBox="-60 -118 120 132" className={className} role="img" aria-label={`${who === 'ali' ? 'Ali' : 'Aisyah'} tampak ${view === 'front' ? 'depan' : view === 'side' ? 'samping' : 'belakang'}`}>
      <defs>
        <pattern id={`${uid}-plaid`} width="7" height="7" patternUnits="userSpaceOnUse">
          <rect width="7" height="7" fill="#15803d" />
          <rect width="3" height="7" fill="#166534" />
          <rect width="7" height="2" y="4" fill="#14532d" opacity="0.6" />
          <rect width="0.6" height="7" x="5.2" fill="#bbf7d0" opacity="0.8" />
          <rect width="7" height="0.6" y="1.5" fill="#bbf7d0" opacity="0.5" />
        </pattern>
      </defs>
      <Floor sk={sk} view={view} />
      <motion.g animate={jump}>
        <motion.g
          animate={still ? undefined : { scaleY: [1, 1.012, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
        >
          {buildBody(sk, view, who, blink, calm, uid).map((i) => i.el)}
        </motion.g>
      </motion.g>
    </svg>
  );
}

export const FrontView = (p: ViewProps) => <CharacterSVG {...p} view="front" />;
export const SideView = (p: ViewProps) => <CharacterSVG {...p} view="side" />;
export const BackView = (p: ViewProps) => <CharacterSVG {...p} view="back" />;

export type AngleMode = 'all' | View;
const noop = () => () => {};
// Aset asli per sudut di public/aset/{tokoh}/{gerakan}-{front|side|back}:
// .mp4 = potongan video dari folder ASET (latar putih), .png = frame diam untuk thumbnail/kuis.
// Gerakan yang terdaftar di sini memakai aset itu, bukan gambar vektor.
const ASSETS: Record<CharacterName, Seq[]> = {
  ali: ['sapa', 'niat', 'takbir', 'sedekap', 'rukuk', 'itidal', 'sujud', 'duduk', 'salam'],
  aisyah: ['sapa', 'niat', 'takbir', 'sedekap', 'rukuk', 'itidal', 'sujud', 'duduk', 'salam'],
};
const LABEL: Record<View, string> = { front: 'Depan', side: 'Samping', back: 'Belakang' };
const VIEWS: Record<View, typeof FrontView> = { front: FrontView, side: SideView, back: BackView };

type Props = {
  posture: Seq;
  character: CharacterName;
  mode?: AngleMode;
  replayKey?: number;
  jumpKey?: number;
  still?: boolean;
  loop?: boolean;
  labels?: boolean;
  className?: string;
  svgClassName?: string;
};

export default function AnimatedSholatCharacter({
  posture, character, mode = 'front', replayKey = 0, jumpKey = 0, still = false, loop = false, labels = false, className = '', svgClassName = 'h-full w-full',
}: Props) {
  const pose = usePose(posture, replayKey, still, loop);
  const blink = useBlink(!still);
  const jump = useAnimationControls();
  useEffect(() => {
    if (jumpKey) jump.start({ y: [0, -22, 0, -7, 0], transition: { duration: 0.8, times: [0, 0.35, 0.65, 0.82, 1], ease: 'easeOut' } });
  }, [jumpKey, jump]);
  // Gambar hanya di browser: hasil trigonometri server vs browser bisa beda di digit akhir (hydration mismatch).
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const sk = solve(pose);
  const views: View[] = mode === 'all' ? ['front', 'side', 'back'] : [mode];
  return (
    <div className={`flex min-h-0 min-w-0 ${className}`}>
      {views.map((v) => {
        const V = VIEWS[v];
        return (
          <div key={v} className="relative flex min-h-0 min-w-0 flex-1 flex-col items-center">
            {labels && (
              <span className="z-10 rounded-full bg-white/90 px-3 py-0.5 font-display text-xs font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-200">
                {LABEL[v]}
              </span>
            )}
            {/* animasi lompat untuk aset; tokoh vektor melompat sendiri lewat prop jump */}
            <motion.div animate={ASSETS[character].includes(posture) ? jump : undefined} className="min-h-0 w-full flex-1">
              {ASSETS[character].includes(posture) && !still ? (
                <video
                  key={`${replayKey}-${v}`}
                  src={`/aset/${character}/${posture}-${v}.mp4`}
                  poster={`/aset/${character}/${posture}-${v}.png`}
                  autoPlay muted loop playsInline
                  aria-label={`${character === 'ali' ? 'Ali' : 'Aisyah'} tampak ${LABEL[v].toLowerCase()}`}
                  // latar video putih → hilang di atas latar halaman
                  className={`${svgClassName} select-none object-contain mix-blend-multiply`}
                />
              ) : ASSETS[character].includes(posture) ? (
                <motion.img
                  src={`/aset/${character}/${posture}-${v}.png`}
                  alt={`${character === 'ali' ? 'Ali' : 'Aisyah'} tampak ${LABEL[v].toLowerCase()}`}
                  draggable={false}
                  className={`${svgClassName} select-none object-contain mix-blend-multiply`}
                />
              ) : (
                mounted && <V sk={sk} who={character} blink={blink} calm={posture !== 'sapa'} jump={jump} still={still} className={svgClassName} />
              )}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
