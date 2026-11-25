// Kerangka tulang 3D sederhana untuk karakter sholat.
// Sumbu: x+ = sisi KIRI karakter, y+ = atas, z+ = arah kiblat (karakter menghadap z+).
// Satu pose 3D diproyeksikan ke 3 kamera, jadi Depan/Samping/Belakang selalu konsisten.
import type { Posture } from '@/data/sholatData';

export type V3 = [number, number, number];
export type View = 'front' | 'side' | 'back';

export type Pose = {
  pelvis: V3;
  torso: number; // derajat membungkuk ke depan (0 = tegak, 90 = rukuk)
  head: number; // derajat kepala menunduk (dunia)
  yaw: number; // derajat menoleh; negatif = ke kanan
  handL: V3; handR: V3; // target pergelangan tangan
  dirL: V3; dirR: V3; // arah telapak/jari
  poleL: V3; poleR: V3; // arah tekuk siku
  ankleL: V3; ankleR: V3;
  toeL: V3; toeR: V3; // arah jari kaki
  kneeL: V3; kneeR: V3; // arah tekuk lutut
  finger: number; // telunjuk kanan 0..1
};

// ---------- vektor ----------
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
export const norm = (a: V3): V3 => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const rad = (d: number) => (d * Math.PI) / 180;
const rotY = (v: V3, deg: number): V3 => {
  const c = Math.cos(rad(deg)), s = Math.sin(rad(deg));
  return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
};

// Gerak bertahap ala animator (overlapping action): badan & kaki dulu, kepala sedikit menyusul,
// tangan menyusul lebih akhir, telunjuk paling akhir. u = progres linear 0..1.
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const late = (u: number, d: number) => ease(Math.min(1, Math.max(0, (u - d) / (1 - d))));
const DELAY: Partial<Record<keyof Pose, number>> = {
  head: 0.08, yaw: 0.08,
  handL: 0.16, handR: 0.16, dirL: 0.2, dirR: 0.2, poleL: 0.16, poleR: 0.16,
  finger: 0.4,
};
export function blendPose(a: Pose, b: Pose, u: number): Pose {
  const o = {} as Record<string, unknown>;
  for (const k of Object.keys(a) as (keyof Pose)[]) {
    const t = late(u, DELAY[k] ?? 0);
    const va = a[k], vb = b[k];
    o[k] = Array.isArray(va) ? lerp3(va as V3, vb as V3, t) : lerp(va as number, vb as number, t);
  }
  return o as Pose;
}

// ---------- ukuran tubuh anak ----------
export const BODY = { thigh: 26, shin: 24, torso: 32, shoulderAt: 28, shoulderW: 10, hipW: 6, upperArm: 18, foreArm: 17, neck: 4, headR: 11, foot: 11 };

// IK dua tulang: akar a, target t, arah tekuk pole.
function ik(a: V3, t: V3, l1: number, l2: number, pole: V3): [V3, V3] {
  const d0 = sub(t, a);
  const d = Math.min(Math.max(len(d0), Math.abs(l1 - l2) + 0.01), l1 + l2 - 0.05);
  const n = norm(d0);
  const x = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(l1 * l1 - x * x, 0));
  const pp = norm(sub(pole, mul(n, dot(pole, n))));
  return [add(add(a, mul(n, x)), mul(pp, h)), add(a, mul(n, d))];
}

export type Skeleton = {
  pelvis: V3; up: V3; fwd: V3; neck: V3; chest: V3;
  hipL: V3; hipR: V3; kneeL: V3; kneeR: V3; ankleL: V3; ankleR: V3; toeL: V3; toeR: V3;
  shL: V3; shR: V3; elL: V3; elR: V3; wrL: V3; wrR: V3; tipL: V3; tipR: V3;
  headC: V3; headUp: V3; face: V3; headRight: V3;
  finger: number; fingerTip: V3;
};

// Ujung kaki tidak boleh menembus lantai (terjadi di tengah transisi sujud -> duduk).
function foot(ankle: V3, dir: V3): V3 {
  const t = add(ankle, mul(norm(dir), BODY.foot));
  return [t[0], Math.max(t[1], 0.3), t[2]];
}

export function solve(p: Pose): Skeleton {
  const tp = rad(p.torso);
  const up: V3 = [0, Math.cos(tp), Math.sin(tp)];
  const fwd: V3 = [0, -Math.sin(tp), Math.cos(tp)];
  const neck = add(p.pelvis, mul(up, BODY.torso));
  const chest = add(p.pelvis, mul(up, BODY.shoulderAt));
  const hp = rad(p.head);
  const headUp = rotY([0, Math.cos(hp), Math.sin(hp)], p.yaw);
  const face = rotY([0, -Math.sin(hp), Math.cos(hp)], p.yaw);
  const headRight = rotY([1, 0, 0], p.yaw);
  const headC = add(neck, mul(headUp, BODY.neck + BODY.headR));

  const hipL = add(p.pelvis, [BODY.hipW, 0, 0]);
  const hipR = add(p.pelvis, [-BODY.hipW, 0, 0]);
  const [kneeL, ankleL] = ik(hipL, p.ankleL, BODY.thigh, BODY.shin, p.kneeL);
  const [kneeR, ankleR] = ik(hipR, p.ankleR, BODY.thigh, BODY.shin, p.kneeR);
  const shL = add(chest, [BODY.shoulderW, 0, 0]);
  const shR = add(chest, [-BODY.shoulderW, 0, 0]);
  const [elL, wrL] = ik(shL, p.handL, BODY.upperArm, BODY.foreArm, p.poleL);
  const [elR, wrR] = ik(shR, p.handR, BODY.upperArm, BODY.foreArm, p.poleR);
  const handLen = lerp(6.5, 3.6, p.finger);
  const dR = norm(p.dirR);
  return {
    pelvis: p.pelvis, up, fwd, neck, chest, hipL, hipR, kneeL, kneeR, ankleL, ankleR,
    toeL: foot(ankleL, p.toeL), toeR: foot(ankleR, p.toeR),
    shL, shR, elL, elR, wrL, wrR,
    tipL: add(wrL, mul(norm(p.dirL), 6.5)), tipR: add(wrR, mul(dR, handLen)),
    headC, headUp, face, headRight,
    finger: p.finger,
    fingerTip: add(add(wrR, mul(dR, handLen)), mul(norm(add(dR, [0, 0.45, 0])), 6 * p.finger)),
  };
}

// ---------- proyeksi kamera (orthografis, sedikit dari atas) ----------
const ELEV = rad(12);
const CE = Math.cos(ELEV), SE = Math.sin(ELEV);
/** -> [x layar, y layar (ke bawah), kedekatan ke kamera] */
export function project(p: V3, view: View): [number, number, number] {
  let h: number, d: number;
  if (view === 'front') { h = p[0]; d = p[2]; }
  else if (view === 'side') { h = p[2] - 7; d = -p[0]; } // kamera di sisi kanan karakter
  else { h = -p[0]; d = -p[2]; }
  return [h, -(p[1] * CE - d * SE), d];
}
/** kedekatan sebuah arah terhadap kamera (1 = menghadap kamera) */
export function facing(v: V3, view: View) {
  return view === 'front' ? v[2] : view === 'side' ? -v[0] : -v[2];
}

// ---------- pose kunci ----------
const STAND: Pose = {
  pelvis: [0, 53.5, 0], torso: 0, head: 12, yaw: 0,
  handL: [11.5, 48, 1.5], handR: [-11.5, 48, 1.5],
  dirL: [0.1, -1, 0.15], dirR: [-0.1, -1, 0.15],
  poleL: [0.3, 0, -1], poleR: [-0.3, 0, -1],
  ankleL: [6, 4, 0], ankleR: [-6, 4, 0],
  toeL: [0.1, -0.33, 1], toeR: [-0.1, -0.33, 1],
  kneeL: [0, 0, 1], kneeR: [0, 0, 1],
  finger: 0,
};
const P = (over: Partial<Pose>, base: Pose = STAND): Pose => ({ ...base, ...over });

// telapak di samping telinga (ibu jari dekat daun telinga), tidak menutupi wajah
const HANDS_UP: Partial<Pose> = {
  handL: [16, 92, 4], handR: [-16, 92, 4],
  dirL: [0, 1, 0.1], dirR: [0, 1, 0.1],
  poleL: [0.9, -1, -0.3], poleR: [-0.9, -1, -0.3],
};
export const POSES = {
  stand: STAND,
  takbirUp: P({ ...HANDS_UP, head: 6 }),
  sedekap: P({
    handR: [-2, 62.5, 10.5], handL: [2.5, 61, 9],
    dirR: [1, 0.12, 0.1], dirL: [-1, 0.05, 0.1],
    poleL: [1, -0.5, -0.4], poleR: [-1, -0.5, -0.4], head: 14,
  }),
  rukuk: P({
    pelvis: [0, 53.5, -4], torso: 90, head: 92,
    handL: [7.5, 30, 3], handR: [-7.5, 30, 3],
    dirL: [0, -1, 0.25], dirR: [0, -1, 0.25],
    poleL: [0.5, 0.3, -1], poleR: [-0.5, 0.3, -1],
  }),
  itidalUp: P({ ...HANDS_UP, head: 8 }),
  itidal: P({ head: 8 }),
  kneel: P({
    pelvis: [0, 31, -4], torso: 6, head: 22,
    handL: [9, 24, 6], handR: [-9, 24, 6], dirL: [0, -1, 0.3], dirR: [0, -1, 0.3],
    ankleL: [6, 7.5, -24], ankleR: [-6, 7.5, -24], toeL: [0, -0.8, 0.6], toeR: [0, -0.8, 0.6],
  }),
  sujud: P({
    pelvis: [0, 31, -6], torso: 112, head: 122,
    handL: [12.5, 1.8, 31], handR: [-12.5, 1.8, 31], dirL: [0, -0.05, 1], dirR: [0, -0.05, 1],
    poleL: [1, 1, -0.1], poleR: [-1, 1, -0.1],
    ankleL: [6, 8.5, -27], ankleR: [-6, 8.5, -27], toeL: [0, -0.82, 0.57], toeR: [0, -0.82, 0.57],
  }),
  duduk: P({
    pelvis: [0, 15, -3], torso: -2, head: 14,
    handL: [8.5, 17.5, 16], handR: [-8.5, 17.5, 16], dirL: [0, -0.2, 1], dirR: [0, -0.2, 1],
    poleL: [0.4, -0.2, -1], poleR: [-0.4, -0.2, -1],
    ankleL: [6, 3.5, -3.5], toeL: [-0.35, -0.1, -1],
    ankleR: [-7, 8, -3.5], toeR: [0, -0.8, 0.6], kneeL: [0, 0.3, 1], kneeR: [0, 0.3, 1],
  }),
  tawarruk: P({
    pelvis: [3, 10, -3], torso: 0, head: 12,
    handL: [11, 12, 15], handR: [-7, 12.5, 15], dirL: [0, -0.2, 1], dirR: [0, -0.15, 1],
    poleL: [0.4, -0.2, -1], poleR: [-0.4, -0.2, -1],
    ankleL: [-11, 3.5, -1], toeL: [-1, -0.1, -0.15], kneeL: [0.2, 0, 1],
    ankleR: [-8, 8, -4], toeR: [0, -0.8, 0.6], kneeR: [0, 0.3, 1],
  }),
  waveA: P({ handR: [-25, 94, 5], dirR: [-0.45, 1, 0.1], poleR: [-1, -1, 0], head: 4, yaw: -8 }),
  waveB: P({ handR: [-20, 99, 6], dirR: [0.2, 1, 0.1], poleR: [-1, -1, 0], head: 4, yaw: -8 }),
};
const tasyahud = P({ finger: 1 }, POSES.tawarruk);

export type Key = { pose: Pose; dur?: number; hold?: number };
export type Seq = Posture | 'sapa';

export const SEQUENCES: Record<Seq, Key[]> = {
  niat: [{ pose: POSES.stand }],
  takbir: [{ pose: POSES.stand, hold: 350 }, { pose: POSES.takbirUp, hold: 900 }, { pose: POSES.sedekap }],
  sedekap: [{ pose: POSES.sedekap }],
  rukuk: [{ pose: POSES.sedekap, hold: 400 }, { pose: POSES.rukuk, dur: 1.1 }],
  itidal: [{ pose: POSES.rukuk, hold: 400 }, { pose: POSES.itidalUp, dur: 1.1, hold: 700 }, { pose: POSES.itidal }],
  sujud: [{ pose: POSES.itidal, hold: 300 }, { pose: POSES.kneel, dur: 1, hold: 100 }, { pose: POSES.sujud, dur: 1 }],
  duduk: [{ pose: POSES.sujud, hold: 400 }, { pose: POSES.duduk, dur: 1 }],
  salam: [
    { pose: POSES.duduk, hold: 300 },
    { pose: POSES.tawarruk, hold: 250 },
    { pose: tasyahud, dur: 0.6, hold: 1200 },
    { pose: P({ yaw: -68 }, tasyahud), dur: 1, hold: 900 },
    { pose: tasyahud, dur: 0.8, hold: 250 },
    { pose: P({ yaw: 68 }, tasyahud), dur: 1, hold: 900 },
    { pose: tasyahud, dur: 0.8 },
  ],
  sapa: [
    { pose: POSES.stand, hold: 600 },
    { pose: POSES.waveA, dur: 0.6 },
    { pose: POSES.waveB, dur: 0.35 },
    { pose: POSES.waveA, dur: 0.35 },
    { pose: POSES.waveB, dur: 0.35 },
    { pose: POSES.stand, dur: 0.7, hold: 1500 },
  ],
};

export const finalPose = (s: Seq) => SEQUENCES[s][SEQUENCES[s].length - 1].pose;
