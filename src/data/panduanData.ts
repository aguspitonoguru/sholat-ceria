// Materi pendukung halaman Panduan Sholat (/belajar/panduan).
import type { Material, Posture, Reading } from '@/data/sholatData';

export const SYARAT_SAH = [
  { title: 'Beragama Islam', desc: 'Sholat adalah ibadah wajib bagi setiap muslim.' },
  { title: 'Suci dari hadas', desc: 'Sudah berwudhu. Jika berhadas besar, mandi wajib terlebih dahulu.' },
  { title: 'Bersih dari najis', desc: 'Badan, pakaian, dan tempat sholat harus bersih.' },
  { title: 'Menutup aurat', desc: 'Laki-laki: antara pusar dan lutut. Perempuan: seluruh tubuh kecuali wajah dan telapak tangan.' },
  { title: 'Sudah masuk waktu', desc: 'Sholat dikerjakan setelah waktunya tiba, biasanya ditandai adzan.' },
  { title: 'Menghadap kiblat', desc: 'Kiblat adalah arah Ka’bah di Makkah.' },
];

type Baca = { arabic: string; latin: string; meaning: string };
const NIAT_WUDHU: Baca = {
  arabic: 'نَوَيْتُ الْوُضُوْءَ لِرَفْعِ الْحَدَثِ الْأَصْغَرِ فَرْضًا لِلّٰهِ تَعَالَى',
  latin: 'Nawaitul wudhuu’a liraf’il hadatsil ashghari fardhal lillaahi ta’aalaa.',
  meaning: 'Aku berniat wudhu untuk menghilangkan hadas kecil, fardhu karena Allah Ta’ala.',
};
const BATAL_WUDHU = ['Buang air kecil atau besar', 'Buang angin (kentut)', 'Tidur nyenyak', 'Hilang akal, misalnya pingsan'];

// clip = /public/wudhu/{clip}.mp4 (potongan video animasi wudhu, tanpa suara & subtitle).
export const WUDHU: { niat: Baca; batal: string[]; langkah: { clip: string; title: string; desc: string; kali?: number; baca?: Baca; list?: string[] }[] } = {
  niat: NIAT_WUDHU,
  batal: BATAL_WUDHU,
  langkah: [
    { clip: 'niat', title: 'Niat Wudhu', desc: 'Niatkan di dalam hati bahwa kamu akan berwudhu untuk menghilangkan hadas kecil. Niat dihadirkan saat mulai membasuh wajah.', baca: NIAT_WUDHU },
    { clip: 'bismillah', title: 'Membaca Basmalah', desc: 'Awali wudhu dengan membaca basmalah.', baca: { arabic: 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ', latin: 'Bismillaahir rahmaanir rahiim.', meaning: 'Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang.' } },
    { clip: 'tangan', title: 'Mencuci Kedua Telapak Tangan', desc: 'Cuci kedua telapak tangan sampai pergelangan, termasuk punggung tangan dan sela-sela jari.', kali: 3 },
    { clip: 'kumur', title: 'Berkumur-kumur', desc: 'Ambil air dengan tangan kanan, masukkan ke mulut, kumur-kumur, lalu buang airnya.', kali: 3 },
    { clip: 'hidung', title: 'Membersihkan Hidung', desc: 'Hirup sedikit air ke hidung dengan tangan kanan, lalu keluarkan dengan tangan kiri.', kali: 3 },
    { clip: 'wajah', title: 'Membasuh Wajah', desc: 'Basuh seluruh wajah: dari tempat tumbuh rambut di dahi sampai dagu, dan dari telinga kanan sampai telinga kiri. Yang berjenggot, sela-selai jenggotnya dengan jari yang basah.', kali: 3 },
    { clip: 'lengan', title: 'Membasuh Tangan sampai Siku', desc: 'Mulai dari tangan kanan: basuh dari ujung jari sampai melewati siku. Setelah itu tangan kiri.', kali: 3 },
    { clip: 'kepala', title: 'Mengusap Kepala', desc: 'Basahi kedua tangan, lalu usapkan ke kepala dari depan ke belakang dan kembali ke depan.' },
    { clip: 'telinga', title: 'Mengusap Kedua Telinga', desc: 'Bersihkan bagian dalam telinga dengan jari telunjuk dan bagian belakangnya dengan ibu jari.' },
    { clip: 'kaki', title: 'Membasuh Kedua Kaki', desc: 'Basuh kaki kanan sampai mata kaki, bersihkan sela-sela jari kaki dengan jari kelingking. Setelah itu kaki kiri.', kali: 3 },
    { clip: 'doa', title: 'Doa Setelah Wudhu', desc: 'Selesai wudhu, menghadap kiblat lalu bacalah doa setelah wudhu.', baca: {
      arabic: 'أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيْكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُوْلُهُ، اَللّٰهُمَّ اجْعَلْنِيْ مِنَ التَّوَّابِيْنَ وَاجْعَلْنِيْ مِنَ الْمُتَطَهِّرِيْنَ',
      latin: 'Asyhadu an laa ilaaha illallaahu wahdahu laa syariika lah, wa asyhadu anna Muhammadan ‘abduhu wa rasuuluh. Allaahummaj’alnii minat tawwaabiina waj’alnii minal mutathahhiriin.',
      meaning: 'Aku bersaksi tiada Tuhan selain Allah Yang Maha Esa, tiada sekutu bagi-Nya, dan aku bersaksi Muhammad adalah hamba dan utusan-Nya. Ya Allah, jadikanlah aku termasuk orang yang bertaubat dan orang yang menyucikan diri.',
    } },
    { clip: 'batal', title: 'Yang Membatalkan Wudhu', desc: 'Wudhumu tetap sah dan boleh dipakai sholat selama belum batal. Wudhu batal karena:', list: BATAL_WUDHU },
  ],
};

export const WAKTU = [
  { slug: 'subuh', name: 'Subuh', rakaat: 2, jahr: 2, time: 'Terbit fajar sampai sebelum matahari terbit', color: 'from-indigo-400 to-sky-400' },
  { slug: 'dzuhur', name: 'Dzuhur', rakaat: 4, jahr: 0, time: 'Setelah matahari tergelincir dari tengah langit (siang)', color: 'from-amber-300 to-yellow-400' },
  { slug: 'ashar', name: 'Ashar', rakaat: 4, jahr: 0, time: 'Sore hari, saat bayangan lebih panjang dari bendanya', color: 'from-orange-300 to-amber-500' },
  { slug: 'maghrib', name: 'Maghrib', rakaat: 3, jahr: 2, time: 'Saat matahari terbenam', color: 'from-rose-400 to-orange-400' },
  { slug: 'isya', name: 'Isya', rakaat: 4, jahr: 2, time: 'Malam hari, setelah mega merah di langit hilang', color: 'from-violet-500 to-indigo-600' },
];

/** baca & tip mengganti bacaan/tip bawaan langkah (dipakai urutan khusus sholat sunnah). */
export type Langkah = { label: string; posture: Posture; note?: string; baca?: Pick<Reading, 'arabic' | 'latin' | 'meaning'>; tip?: string };

// Urutan lengkap sholat fardhu per rakaat. jahr = berapa rakaat awal yang Al-Fatihah & surahnya dibaca keras.
export function urutanSholat(rakaat: number, jahr: number): Langkah[][] {
  return Array.from({ length: rakaat }, (_, i) => {
    const k = i + 1, baca = k <= jahr ? 'dibaca keras' : 'dibaca pelan';
    const r: Langkah[] = k === 1
      ? [
        { label: 'Niat & berdiri tegak', posture: 'niat', note: 'niat di dalam hati' },
        { label: 'Takbiratul ihram', posture: 'takbir', note: '“Allaahu Akbar”' },
        { label: 'Doa iftitah', posture: 'sedekap', note: 'dibaca pelan' },
      ]
      : [{ label: 'Bangkit berdiri', posture: 'niat', note: 'sambil takbir' }];
    r.push({ label: 'Al-Fatihah', posture: 'sedekap', note: baca });
    if (k <= 2) r.push({ label: 'Surah pendek', posture: 'sedekap', note: baca });
    r.push(
      { label: 'Rukuk', posture: 'rukuk', note: 'tasbih 3x' },
      { label: 'I’tidal', posture: 'itidal', note: '“Sami’allaahu liman hamidah”' },
      { label: 'Sujud pertama', posture: 'sujud', note: 'tasbih 3x' },
      { label: 'Duduk di antara dua sujud', posture: 'duduk', note: '“Rabbighfirlii…”' },
      { label: 'Sujud kedua', posture: 'sujud', note: 'tasbih 3x' },
    );
    if (k === 2 && rakaat > 2) r.push({ label: 'Tasyahud awal', posture: 'duduk', note: 'duduk iftirasy, sampai sholawat' });
    if (k === rakaat) r.push(
      { label: 'Tasyahud akhir', posture: 'salam', note: 'duduk tawarruk + sholawat' },
      { label: 'Salam', posture: 'salam', note: 'ke kanan lalu ke kiri' },
    );
    return r;
  });
}

// Materi langkah demi langkah satu sholat: tiap langkah = gerakan dasar + bacaan yang sesuai.
// opt.niat/urutan dipakai sholat selain fardhu; tanpaRakaat = keterangan langkah tanpa “Rakaat N” (mis. jenazah).
export function buildSholat(ms: Material[], w: { name: string; rakaat: number; jahr: number }, opt: { niat?: Reading; urutan?: Langkah[][]; tanpaRakaat?: boolean } = {}) {
  const by = (p: Posture) => ms.find((m) => m.slug === p)!;
  const read = (p: Posture, prefix: string) => by(p).extra?.find((e) => e.title.startsWith(prefix));
  const baca = (r?: Pick<Reading, 'arabic' | 'latin' | 'meaning'>): Partial<Material> => (r ? { arabic: r.arabic, latin: r.latin, meaning: r.meaning, tts: true } : {});
  const tasyahud = read('salam', 'Bacaan Tasyahud'), sholawat = read('salam', 'Sholawat');
  const BACAAN: Record<string, Partial<Material>> = {
    'Niat & berdiri tegak': opt.niat ? baca(opt.niat) : w.name === 'Subuh' ? {} : baca(read('niat', `Niat Sholat ${w.name}`)),
    'Doa iftitah': { ...baca(read('sedekap', 'Doa Iftitah')), tip: 'Bersedekap dengan tenang lalu membaca doa iftitah pelan-pelan. Doa iftitah hanya di rakaat pertama.' },
    'Al-Fatihah': { ...baca(read('sedekap', 'Surah Al-Fatihah')), tip: 'Baca Al-Fatihah lengkap 7 ayat dengan tartil, lalu ucapkan “Aamiin”.' },
    'Surah pendek': { ...baca(read('sedekap', 'Surah Al-Ikhlas')), tip: 'Setelah Al-Fatihah, baca surah pendek yang kamu hafal, misalnya Al-Ikhlas.' },
    'Bangkit berdiri': { ...baca(by('takbir')), tip: 'Bangkit berdiri tegak sambil mengucap “Allaahu Akbar”, lalu bersedekap kembali.' },
    'Tasyahud awal': { ...baca(tasyahud), tip: 'Duduk iftirasy, baca tasyahud lalu sholawat, kemudian bangkit berdiri untuk rakaat berikutnya.' },
    'Tasyahud akhir': { ...baca(tasyahud), extra: sholawat && [sholawat], tip: 'Duduk tawarruk, baca tasyahud lalu sholawat Ibrahimiyah (lihat tab Bacaan Lengkap).' },
  };
  const items: Material[] = [], sub: string[] = [];
  (opt.urutan ?? urutanSholat(w.rakaat, w.jahr)).forEach((r, ri) => r.forEach((it) => {
    const o = { ...BACAAN[it.label], ...baca(it.baca), ...(it.tip && { tip: it.tip }) };
    // bacaan tambahan bawaan gerakan (mis. daftar niat lain) tidak dipakai di sini; hanya yang ditetapkan di BACAAN
    items.push({ ...by(it.posture), ...o, extra: o.extra, id: items.length + 1, title: it.label, shortTitle: it.label });
    sub.push(opt.tanpaRakaat ? it.note ?? '' : `Rakaat ${ri + 1}${it.note ? ` · ${it.note}` : ''}`);
  }));
  return { items, sub };
}

export const PEMBATAL = [
  'Berbicara dengan sengaja',
  'Makan atau minum',
  'Tertawa terbahak-bahak',
  'Banyak bergerak di luar gerakan sholat',
  'Batal wudhu (berhadas)',
  'Membelakangi kiblat',
  'Aurat terbuka dengan sengaja',
  'Meninggalkan salah satu rukun sholat dengan sengaja',
];
