// Cek cepat rig karakter: `node scripts/check-rig.mjs`
// Semua pose kunci + titik tengah transisi: angka valid, panjang tulang tetap, tubuh tidak tembus lantai.
import assert from 'node:assert/strict';
import { BODY, SEQUENCES, blendPose, solve } from '../src/lib/rig.ts';

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const near = (v, want, label) => assert.ok(Math.abs(v - want) < 0.3, `${label}: ${v.toFixed(2)} != ${want}`);
let n = 0;

for (const [name, keys] of Object.entries(SEQUENCES)) {
  const poses = keys.flatMap((k, i) => (i ? [0.25, 0.5, 0.75].map((u) => blendPose(keys[i - 1].pose, k.pose, u)).concat(k.pose) : [k.pose]));
  for (const p of poses) {
    const s = solve(p);
    for (const v of Object.values(s)) if (Array.isArray(v)) v.forEach((x) => assert.ok(Number.isFinite(x), `${name}: NaN`));
    near(dist(s.hipL, s.kneeL), BODY.thigh, `${name} paha kiri`);
    near(dist(s.kneeR, s.ankleR), BODY.shin, `${name} betis kanan`);
    near(dist(s.shR, s.elR), BODY.upperArm, `${name} lengan atas kanan`);
    near(dist(s.elL, s.wrL), BODY.foreArm, `${name} lengan bawah kiri`);
    for (const [part, pt] of Object.entries({ kneeL: s.kneeL, kneeR: s.kneeR, toeL: s.toeL, toeR: s.toeR, wrL: s.wrL, wrR: s.wrR }))
      assert.ok(pt[1] > -1.5, `${name}: ${part} tembus lantai (y=${pt[1].toFixed(1)})`);
    assert.ok(s.headC[1] - BODY.headR > -1.5, `${name}: kepala tembus lantai`);
    n++;
  }
}
// Rukuk harus 90°: bahu dan pinggul sejajar (punggung rata)
const r = solve(SEQUENCES.rukuk.at(-1).pose);
assert.ok(Math.abs(r.chest[1] - r.pelvis[1]) < 1, 'rukuk: punggung tidak rata');
// Salam: kepala benar-benar menoleh kanan lalu kiri
const yaws = SEQUENCES.salam.map((k) => k.pose.yaw);
assert.ok(Math.min(...yaws) < -60 && Math.max(...yaws) > 60, 'salam: tidak menoleh');
console.log(`OK: ${n} pose dicek`);
