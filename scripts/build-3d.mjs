// Bangun aset 3D Ali (pose Takbiratul Ihram) -> public/aset/ali/3d/takbir.glb
// Model bersendi (Hips > Spine > Chest > Neck > Head, UpperArm > LowerArm > Hand, UpperLeg > LowerLeg > Foot):
// gerakan sholat lain cukup memutar sendi-sendi ini. Jalankan: npm run build:3d
import { writeFileSync, mkdirSync } from 'node:fs';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

// GLTFExporter (mode biner) memakai FileReader milik browser; Node tidak punya.
globalThis.FileReader ??= class {
  #done(r) { this.result = r; this.onload?.({ target: this }); this.onloadend?.({ target: this }); }
  readAsArrayBuffer(b) { b.arrayBuffer().then((r) => this.#done(r)); }
  readAsDataURL(b) { b.arrayBuffer().then((r) => this.#done(`data:${b.type || 'application/octet-stream'};base64,${Buffer.from(r).toString('base64')}`)); }
};

const V = (...a) => new THREE.Vector3(...a);
const mat = (color, roughness = 0.7, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
const M = {
  skin: mat('#f3c6a1', 0.55), skinDark: mat('#e3a882', 0.6), koko: mat('#f8f8f4', 0.85, { side: THREE.DoubleSide }), kokoLine: mat('#cfd6de', 0.8),
  peci: mat('#141414', 1), hair: mat('#5a3820', 0.6), eyeW: mat('#ffffff', 0.15), iris: mat('#6e4220', 0.25), irisIn: mat('#9a6a38', 0.25),
  pupil: mat('#120b06', 0.15), lash: mat('#2a1a10', 0.6), brow: mat('#4a2c17', 0.8), mouth: mat('#a2473a', 0.5),
  cheek: mat('#f28b8b', 0.6, { transparent: true, opacity: 0.4 }), fringe: mat('#efe6cc', 0.9),
  rugBase: mat('#2f5d48', 0.9), vc: mat('#ffffff', 0.9, { vertexColors: true }),
};

const root = new THREE.Group();
root.name = 'Ali';
// Semua dibangun di koordinat dunia lalu dipasang ke sendi dengan attach() (transform dunia tetap).
function put(geo, m, name, pos = [0, 0, 0], scale = [1, 1, 1], rot = [0, 0, 0], parent = root) {
  const o = new THREE.Mesh(geo, m);
  o.name = name; o.position.set(...pos); o.scale.set(...scale); o.rotation.set(...rot);
  parent.add(o);
  return o;
}
function between(a, b, geoFor, m, name) {
  const A = V(...a), B = V(...b), d = B.clone().sub(A);
  const o = put(geoFor(d.length()), m, name);
  o.position.copy(A.add(B).multiplyScalar(0.5));
  o.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
  return o;
}
const limb = (a, b, r, m, name) => between(a, b, (l) => new THREE.CapsuleGeometry(r, l, r > 0.02 ? 6 : 3, r > 0.02 ? 16 : 8), m, name);
const strip = (a, b, w, m, name) => between(a, b, (l) => new THREE.BoxGeometry(w, l, 0.004), m, name);

// Warna per segitiga (geometri non-indexed) dari fungsi pola -> motif tanpa tekstur.
function paint(geo, colorAt) {
  const g = geo.toNonIndexed(), p = g.attributes.position, c = new Float32Array(p.count * 3), col = new THREE.Color();
  g.deleteAttribute('uv'); // tanpa tekstur, hemat ukuran file
  for (let i = 0; i < p.count; i += 3) {
    const x = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3, y = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3, z = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3;
    col.set(colorAt(x, y, z)); // set() sudah sRGB->linear (ColorManagement)
    for (let k = 0; k < 3; k++) col.toArray(c, (i + k) * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  return g;
}
const band = (t, period, w) => ((t % period) + period) % period < w;

// ---------- titik sendi (koordinat dunia, meter; tinggi total ~1,18 m) ----------
const P = {
  hips: [0, 0.4, 0], chest: [0, 0.62, 0], neck: [0, 0.8, 0], head: [0, 0.86, 0],
  sh: (s) => [s * 0.115, 0.77, 0], el: (s) => [s * 0.245, 0.72, 0.03], wr: (s) => [s * 0.225, 0.89, 0.04],
  hip: (s) => [s * 0.055, 0.38, 0], knee: (s) => [s * 0.055, 0.21, 0], ankle: (s) => [s * 0.05, 0.06, 0],
};
const J = {};
function joint(name, pos, aim) {
  const g = new THREE.Group();
  g.name = name; g.position.set(...pos);
  if (aim) g.quaternion.setFromUnitVectors(V(0, 1, 0), V(...aim).sub(V(...pos)).normalize()); // sumbu +Y sendi = arah tulang
  root.add(g); J[name] = g;
  return g;
}
joint('Hips', P.hips); joint('Spine', P.hips, P.chest); joint('Chest', P.chest, P.neck); joint('Neck', P.neck, P.head); joint('Head', P.head);
const SIDES = [[1, 'L'], [-1, 'R']]; // +x = kiri karakter (karakter menghadap +z)
for (const [s, n] of SIDES) {
  joint(`UpperArm.${n}`, P.sh(s), P.el(s)); joint(`LowerArm.${n}`, P.el(s), P.wr(s)); joint(`Hand.${n}`, P.wr(s));
  joint(`UpperLeg.${n}`, P.hip(s), P.knee(s)); joint(`LowerLeg.${n}`, P.knee(s), P.ankle(s)); joint(`Foot.${n}`, P.ankle(s));
}
const meshesOf = {}; // nama sendi -> mesh yang ikut sendi itu
const to = (j, ...objs) => (meshesOf[j] ??= []).push(...objs);

// ---------- sajadah (tidak ikut sendi) ----------
const RUG = { w: 0.46, l: 0.74, z: 0.15 };
put(new THREE.BoxGeometry(RUG.w, 0.012, RUG.l), M.rugBase, 'Sajadah_dasar', [0, 0.006, RUG.z]);
put(paint(new THREE.PlaneGeometry(RUG.w, RUG.l, 30, 48).rotateX(-Math.PI / 2), (x, y, z) => {
  const ax = Math.abs(x), e = Math.min(RUG.w / 2 - ax, RUG.l / 2 - Math.abs(z));
  if (e < 0.012) return '#2f5d48';
  if (e < 0.042) return band(x + z, 0.03, 0.012) ? '#e0c97f' : '#c9a85a'; // bingkai emas
  if (e < 0.052) return '#2f5d48';
  const t = (z - 0.05) / 0.26; // mihrab: 0 = kaki lengkung, 1 = puncak
  const half = 0.15 * Math.sqrt(Math.max(0, 1 - t * t));
  if (t > 0 && t < 1 && ax < half) return ax > half - 0.012 || t > 0.95 ? '#d7bd6b' : '#6f9c84';
  if (Math.abs(t) < 0.03 && ax < 0.15) return '#d7bd6b';
  return '#4f7d66';
}), M.vc, 'Sajadah_motif', [0, 0.0125, RUG.z]);
for (const s of [-1, 1]) put(new THREE.BoxGeometry(RUG.w - 0.04, 0.004, 0.022), M.fringe, `Rumbai_${s}`, [0, 0.003, RUG.z + s * (RUG.l / 2 + 0.011)]);

// ---------- kaki ----------
for (const [s, n] of SIDES) {
  to(`Foot.${n}`,
    put(new THREE.SphereGeometry(1, 24, 16), M.skin, `Telapak_kaki.${n}`, [s * 0.05, 0.035, 0.03], [0.034, 0.025, 0.062]),
    limb([s * 0.05, 0.04, 0], [s * 0.05, 0.09, 0], 0.026, M.skin, `Pergelangan_kaki.${n}`),
    ...[0, 1, 2, 3, 4].map((i) => put(new THREE.SphereGeometry(0.0085 - i * 0.0008, 10, 8), M.skin, `Jari_kaki.${n}${i}`, [s * (0.037 + i * 0.0075), 0.024, 0.088 - i * 0.004])));
}

// ---------- sarung kotak-kotak hijau (ikut Hips) ----------
const sarungGeo = new THREE.CylinderGeometry(0.13, 0.122, 0.35, 48, 18);
sarungGeo.scale(1, 1, 0.8);
// motif per sel grid (~1,8 cm): pita gelap 2 sel + garis terang 1 sel tiap 5 sel
to('Hips', put(paint(sarungGeo, (x, y, z) => {
  const a = Math.floor((Math.atan2(x, z) / (2 * Math.PI) + 0.5) * 48) % 5, b = Math.floor((y + 0.175) / 0.35 * 18) % 5;
  if (a === 3 || b === 3) return '#5fae80';
  return a < 2 && b < 2 ? '#0f4a2c' : a < 2 || b < 2 ? '#17643f' : '#22804f';
}), M.vc, 'Sarung', [0, 0.225, 0]));

// ---------- baju koko (ikut Spine) ----------
const torso = [[0.0001, 0.35], [0.135, 0.35], [0.136, 0.37], [0.13, 0.5], [0.125, 0.65], [0.12, 0.74], [0.105, 0.78], [0.075, 0.805], [0.04, 0.82], [0.0001, 0.825]];
to('Spine',
  put(new THREE.LatheGeometry(torso.map(([r, y]) => new THREE.Vector2(r, y)), 64), M.koko, 'Baju_koko', [0, 0, 0], [1, 1, 0.78]),
  put(new THREE.CylinderGeometry(0.04, 0.045, 0.026, 32, 1, true), M.koko, 'Kerah', [0, 0.822, 0], [1, 1, 0.9]),
  strip([0, 0.8, 0.07], [0, 0.66, 0.1], 0.026, M.koko, 'Plaket'),
  ...[-1, 1].map((s) => strip([s * 0.018, 0.8, 0.069], [s * 0.018, 0.66, 0.099], 0.004, M.kokoLine, `Bordir_${s}`)),
  ...[0.77, 0.73, 0.69].map((y, i) => put(new THREE.SphereGeometry(0.0055, 10, 8), M.kokoLine, `Kancing_${i}`, [0, y, 0.078 + (0.8 - y) * 0.17])));
for (const s of [-1, 1]) { // saku bawah
  const pocket = put(new THREE.BoxGeometry(0.06, 0.055, 0.004), M.koko, `Saku_${s}`, [s * 0.075, 0.41, 0.091], [1, 1, 1], [0, s * 0.5, 0]);
  put(new THREE.BoxGeometry(0.062, 0.004, 0.006), M.kokoLine, `Saku_garis_${s}`, [0, 0.025, 0], [1, 1, 1], [0, 0, 0], pocket);
  to('Spine', pocket);
}

// ---------- lengan & tangan (Takbiratul Ihram: tangan setinggi telinga, telapak ke depan) ----------
for (const [s, n] of SIDES) {
  const sh = P.sh(s), el = P.el(s), wr = P.wr(s), cuff = [wr[0] + s * 0.002, wr[1] - 0.03, wr[2]];
  to(`UpperArm.${n}`, put(new THREE.SphereGeometry(0.042, 20, 14), M.koko, `Bahu.${n}`, sh), limb(sh, el, 0.04, M.koko, `Lengan_atas.${n}`));
  to(`LowerArm.${n}`, limb(el, cuff, 0.037, M.koko, `Lengan_bawah.${n}`), limb(cuff, wr, 0.022, M.skin, `Pergelangan.${n}`));
  const h = (dx, dy, dz = 0) => [wr[0] + s * dx, wr[1] + dy, wr[2] + dz]; // dx>0 = sisi luar (kelingking)
  to(`Hand.${n}`,
    put(new THREE.SphereGeometry(1, 24, 16), M.skin, `Telapak.${n}`, h(0, 0.034), [0.033, 0.04, 0.015]),
    // telunjuk di sisi kepala, kelingking di luar; jari sedikit merenggang seperti referensi
    ...[[-0.021, 0.038], [-0.007, 0.042], [0.007, 0.039], [0.021, 0.03]].map(([dx, len], i) =>
      limb(h(dx, 0.062), h(dx * 1.3, 0.062 + len), 0.0088, M.skin, `Jari.${n}${i}`)),
    limb(h(-0.03, 0.025, 0.004), h(-0.055, 0.055, 0.01), 0.0105, M.skin, `Ibu_jari.${n}`));
}

// ---------- kepala chibi (ikut Head) ----------
const HEAD = V(0, 0.94, 0), HS = [1.06, 1, 0.96], HR = 0.14;
const head = [];
to('Neck', limb([0, 0.79, 0], [0, 0.86, 0], 0.032, M.skin, 'Leher'));
head.push(put(new THREE.SphereGeometry(HR, 48, 32), M.skin, 'Kepala', HEAD.toArray(), HS));
// titik di permukaan wajah (x,y relatif pusat kepala) + arah normalnya
function onFace(x, y, out = 0) {
  const u = V(x / HS[0], y / HS[1], 0), z = Math.sqrt(Math.max(0, HR * HR - u.x * u.x - u.y * u.y));
  u.z = z;
  const nrm = V(u.x / HS[0], u.y / HS[1], u.z / HS[2]).normalize();
  return { p: u.multiply(V(...HS)).add(HEAD).addScaledVector(nrm, out), nrm };
}
function onFaceGroup(name, x, y, out = 0) {
  const { p, nrm } = onFace(x, y, out), g = new THREE.Group();
  g.name = name; g.position.copy(p); g.lookAt(p.clone().add(nrm)); root.add(g); head.push(g);
  return g;
}
// rambut: tudung atas sampai sedikit di bawah bibir peci, belakang sampai tengkuk, poni & cambang
head.push(put(new THREE.SphereGeometry(HR + 0.006, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.4), M.hair, 'Rambut_atas', [0, 0.942, -0.004], HS));
head.push(put(new THREE.SphereGeometry(HR + 0.006, 48, 24, Math.PI, Math.PI, 0, Math.PI * 0.7), M.hair, 'Rambut_belakang', [0, 0.942, -0.006], HS));
[[-0.085, 0.4], [-0.045, -0.3], [-0.005, 0.35], [0.04, -0.35], [0.082, 0.3]].forEach(([x, rz], i) =>
  put(new THREE.SphereGeometry(1, 16, 10), M.hair, 'Helai', [0, 0, 0], [0.03, 0.016, 0.009], [0, 0, rz], onFaceGroup(`Poni_${i}`, x, 0.06, -0.002)));
for (const [s, n] of SIDES) {
  put(new THREE.SphereGeometry(1, 16, 10), M.hair, 'Helai', [0, 0, 0], [0.014, 0.032, 0.01], [0, 0, s * 0.15], onFaceGroup(`Cambang.${n}`, s * 0.138, 0.005, -0.004));
  head.push(put(new THREE.SphereGeometry(0.044, 20, 14), M.skin, `Telinga.${n}`, [s * 0.145, 0.928, -0.012], [0.42, 1, 0.75], [0, 0, -s * 0.15]));
  head.push(put(new THREE.SphereGeometry(0.026, 14, 10), M.skinDark, `Telinga_dalam.${n}`, [s * 0.152, 0.926, -0.003], [0.3, 1, 0.7], [0, 0, -s * 0.15]));
  // mata besar ala animasi: putih, iris 2 lapis, pupil, 2 kilau, garis bulu mata atas
  const eye = onFaceGroup(`Mata.${n}`, s * 0.056, -0.012, -0.011);
  eye.scale.setScalar(1.13);
  put(new THREE.SphereGeometry(0.031, 28, 20), M.eyeW, 'Putih', [0, 0, 0], [0.86, 1.08, 0.55], [0, 0, 0], eye);
  put(new THREE.SphereGeometry(0.024, 28, 20), M.iris, 'Iris', [0, -0.003, 0.009], [1, 1.08, 0.45], [0, 0, 0], eye);
  put(new THREE.SphereGeometry(0.017, 24, 16), M.irisIn, 'Iris_dalam', [0, -0.006, 0.011], [1, 1, 0.4], [0, 0, 0], eye);
  put(new THREE.SphereGeometry(0.0115, 20, 14), M.pupil, 'Pupil', [0, -0.004, 0.0135], [1, 1.05, 0.4], [0, 0, 0], eye);
  put(new THREE.SphereGeometry(0.0062, 12, 8), M.eyeW, 'Kilau', [s * -0.008, 0.008, 0.0175], [1, 1, 0.4], [0, 0, 0], eye);
  put(new THREE.SphereGeometry(0.003, 10, 8), M.eyeW, 'Kilau_kecil', [s * 0.007, -0.011, 0.0172], [1, 1, 0.4], [0, 0, 0], eye);
  put(new THREE.TorusGeometry(0.029, 0.0042, 6, 20, Math.PI * 0.8), M.lash, 'Bulu_mata', [0, 0, 0.004], [0.9, 1.1, 1], [0, 0, Math.PI * 0.1], eye);
  // alis lengkung
  put(new THREE.TorusGeometry(0.04, 0.0052, 6, 14, 0.9), M.brow, 'Alis', [0, -0.04, 0], [1, 1, 0.7], [0, 0, Math.PI / 2 - 0.45 + s * 0.08], onFaceGroup(`Alis.${n}`, s * 0.06, 0.04, 0.001));
  put(new THREE.SphereGeometry(0.025, 16, 12), M.cheek, 'Rona', [0, 0, 0], [1, 0.65, 0.25], [0, 0, 0], onFaceGroup(`Rona.${n}`, s * 0.09, -0.052, 0.004));
}
put(new THREE.SphereGeometry(0.012, 16, 12), M.skinDark, 'Hidung', [0, 0, 0], [1.15, 0.85, 0.8], [0, 0, 0], onFaceGroup('Hidung', 0, -0.04, 0.002));
// senyum kecil tertutup
put(new THREE.TorusGeometry(0.019, 0.0034, 8, 18, Math.PI * 0.65), M.mouth, 'Senyum', [0, 0.019, 0], [1, 0.7, 1], [0, 0, -Math.PI / 2 - Math.PI * 0.325], onFaceGroup('Mulut', 0, -0.072, 0.001));
// peci hitam tinggi, lebih lebar dari wajah
head.push(put(new THREE.CylinderGeometry(0.145, 0.152, 0.15, 64), M.peci, 'Peci', [0, 1.08, -0.004], [1, 1, 0.86]));
to('Head', ...head);

// ---------- pasang mesh ke sendi, lalu susun hierarki sendi ----------
for (const [j, list] of Object.entries(meshesOf)) for (const o of list) J[j].attach(o);
const PARENT = { Hips: null, Spine: 'Hips', Chest: 'Spine', Neck: 'Chest', Head: 'Neck' };
for (const [, n] of SIDES) Object.assign(PARENT, {
  [`UpperArm.${n}`]: 'Chest', [`LowerArm.${n}`]: `UpperArm.${n}`, [`Hand.${n}`]: `LowerArm.${n}`,
  [`UpperLeg.${n}`]: 'Hips', [`LowerLeg.${n}`]: `UpperLeg.${n}`, [`Foot.${n}`]: `LowerLeg.${n}`,
});
for (const [c, p] of Object.entries(PARENT)) if (p) J[p].attach(J[c]);

// ---------- ekspor ----------
const scene = new THREE.Scene();
scene.add(root);
const out = new URL('../public/aset/ali/3d/', import.meta.url);
mkdirSync(out, { recursive: true });
const glb = await new GLTFExporter().parseAsync(scene, { binary: true });
writeFileSync(new URL('takbir.glb', out), Buffer.from(glb));

// cek: tinggi wajar, tangan setinggi telinga, rantai sendi utuh, memutar bahu ikut memindah tangan
root.updateMatrixWorld(true);
const box = new THREE.Box3().setFromObject(root);
const at = (name) => new THREE.Box3().setFromObject(root.getObjectByName(name)).getCenter(V());
const ok = (c, msg) => { if (!c) { console.error('GAGAL:', msg); process.exitCode = 1; } };
ok(box.max.y > 1.12 && box.max.y < 1.25, `tinggi ${box.max.y}`);
ok(Math.abs(at('Telapak.L').y - at('Telinga.L').y) < 0.03, 'telapak setinggi telinga');
ok(J['Hand.L'].parent === J['LowerArm.L'] && J['LowerArm.L'].parent === J['UpperArm.L'] && J['UpperArm.L'].parent === J.Chest, 'rantai lengan');
const before = at('Telapak.L');
J['UpperArm.L'].rotateZ(-1); root.updateMatrixWorld(true);
ok(at('Telapak.L').distanceTo(before) > 0.1, 'tangan ikut sendi bahu');
console.log(`takbir.glb ${(glb.byteLength / 1024).toFixed(0)} KB, tinggi ${box.max.y.toFixed(2)} m, ${Object.keys(J).length} sendi`);
