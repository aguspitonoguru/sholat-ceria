// Materi sholat selain fardhu 5 waktu: sunnah, sholat wajib lainnya, qadha, dan jamak-qashar (/belajar/sunnah).
import { type Langkah, urutanSholat, WAKTU } from '@/data/panduanData';
import { MATERIALS, type Reading } from '@/data/sholatData';
import { type NamaSurah, SURAH } from '@/data/surahData';

export type SholatLain = {
  slug: string;
  name: string;
  kategori: (typeof KATEGORI)[number];
  hukum: string;
  rakaat: string;
  waktu: string;
  desc: string;
  color: string;
  niat: Reading[];
  cara: string[];
  doa?: Reading[];
  catatan?: string[];
  /** Berapa rakaat awal yang bacaannya dikeraskan (default 0 = pelan semua). */
  jahr?: number;
  /** Urutan gerakan untuk niat ke-i. Default: sholat 2 rakaat biasa. */
  urutan?: (i: number) => Langkah[][];
  /** Tidak dihitung per rakaat (sholat jenazah). */
  tanpaRakaat?: boolean;
};

export const KATEGORI = ['Sunnah Rawatib', 'Sunnah Harian', 'Sunnah Malam', 'Sunnah Khusus', 'Sholat Wajib Lainnya', 'Qadha & Musafir'] as const;

const L = 'لِلّٰهِ تَعَالَى';
const sunnah = (title: string, ar: string, lat: string, arti: string): Reading => ({
  title,
  arabic: `أُصَلِّي ${ar} ${L}`,
  latin: `Ushallii ${lat} lillaahi ta’aalaa.`,
  meaning: `Aku berniat sholat ${arti} karena Allah Ta’ala.`,
});

const TASBIH: Reading = {
  title: 'Bacaan Tasbih',
  arabic: 'سُبْحَانَ اللّٰهِ وَالْحَمْدُ لِلّٰهِ وَلَا إِلٰهَ إِلَّا اللّٰهُ وَاللّٰهُ أَكْبَرُ',
  latin: 'Subhaanallaah, walhamdu lillaah, wa laa ilaaha illallaah, wallaahu akbar.',
  meaning: 'Maha Suci Allah, segala puji bagi Allah, tiada Tuhan selain Allah, dan Allah Maha Besar.',
};

const CARA_2 = [
  'Berniat sesuai sholat yang dikerjakan, lalu takbiratul ihram.',
  'Membaca doa iftitah, Al-Fatihah, dan surah pendek.',
  'Rukuk, i’tidal, sujud, duduk di antara dua sujud, lalu sujud lagi.',
  'Berdiri untuk rakaat kedua: Al-Fatihah dan surah pendek, rukuk, i’tidal, dan dua kali sujud.',
  'Tasyahud akhir, sholawat, lalu salam ke kanan dan ke kiri.',
];

// --- Urutan gerakan khusus (dipakai mode belajar langkah demi langkah) ---
const ubah = (r: Langkah[][], f: (l: Langkah, ri: number) => Langkah[]) => r.map((x, ri) => x.flatMap((l) => f(l, ri)));
const TASBIH_LATIN = '“Subhaanallaah, walhamdu lillaah, wa laa ilaaha illallaah, wallaahu akbar”';

const IKHLAS = MATERIALS.find((m) => m.slug === 'sedekap')!.extra!.find((e) => e.title.startsWith('Surah Al-Ikhlas'))!;
type Surah = NamaSurah | 'Al-Ikhlas';
/** Beberapa surah dalam satu langkah (mis. witir rakaat terakhir) digabung jadi satu bacaan. */
const bacaSurah = (ns: Surah[]): Reading => {
  const rs = ns.map((n) => (n === 'Al-Ikhlas' ? IKHLAS : SURAH[n]));
  if (rs.length === 1) return rs[0];
  return {
    title: `Surah ${ns.join(', ')}`,
    arabic: rs.map((r) => r.arabic).join(' ۞ '),
    latin: rs.map((r, i) => `(${ns[i]}) ${r.latin}`).join(' '),
    meaning: rs.map((r, i) => `(${ns[i]}) ${r.meaning}`).join(' '),
  };
};
/** Surah yang dianjurkan per rakaat menggantikan bacaan surah pendek bawaan (Al-Ikhlas). */
const surah = (r: Langkah[][], nama: Surah[][]) => ubah(r, (l, ri) => (l.label === 'Surah pendek' && nama[ri]
  ? [{ ...l, note: `${l.note} · ${nama[ri].join(', ')}`, baca: bacaSurah(nama[ri]), tip: `Setelah Al-Fatihah, dianjurkan membaca surah ${nama[ri].join(', ')}. Jika belum hafal, boleh membaca surah pendek lain yang kamu hafal.` }]
  : [l]));

/** Sholat Id & Istisqa: takbir tambahan 7x di rakaat 1 (setelah iftitah) dan 5x di rakaat 2 (setelah bangkit). */
const takbirTambahan = (r: Langkah[][]) => ubah(r, (l, ri) => {
  const t = (n: number): Langkah => ({
    label: `Takbir ${n} kali`, posture: 'takbir', note: 'tasbih di antara takbir', baca: TASBIH,
    tip: `Angkat kedua tangan dan ucapkan “Allaahu Akbar” sebanyak ${n} kali. Di antara setiap takbir, bersedekap dan baca tasbih di bawah ini dengan pelan.`,
  });
  return ri === 0 && l.label === 'Doa iftitah' ? [l, t(7)] : ri === 1 && l.label === 'Bangkit berdiri' ? [l, t(5)] : [l];
});

/** Sholat gerhana: setiap rakaat dua kali berdiri membaca dan dua kali rukuk. */
const gerhana = (jahr: number) => ubah(urutanSholat(2, jahr), (l) => (l.label === 'I’tidal' ? [
  { ...l, label: 'I’tidal pertama', note: 'belum sujud, berdiri membaca lagi' },
  { label: 'Al-Fatihah', posture: 'sedekap', note: 'berdiri kedua' },
  { label: 'Surah pendek', posture: 'sedekap', note: 'lebih pendek dari yang pertama', tip: 'Setelah Al-Fatihah, baca surah lagi. Dianjurkan lebih pendek dari surah di berdiri pertama.' },
  { label: 'Rukuk kedua', posture: 'rukuk', note: 'rukuk yang lama' },
  { ...l, label: 'I’tidal kedua', note: 'lalu sujud' },
] : l.label === 'Surah pendek' ? [{ ...l, tip: 'Di berdiri pertama dianjurkan membaca surah yang panjang (misalnya Al-Baqarah). Jika belum hafal, baca surah yang kamu hafal.' }]
  : l.label === 'Rukuk' ? [{ ...l, label: 'Rukuk pertama', note: 'rukuk yang lama' }] : [l]));

/** Sholat tasbih: 75 tasbih per rakaat (15 + 10 x 6). */
const TASBIH_N: Record<string, number> = { 'Surah pendek': 15, Rukuk: 10, 'I’tidal': 10, 'Sujud pertama': 10, 'Duduk di antara dua sujud': 10, 'Sujud kedua': 10 };
const urutanTasbih = () => ubah(urutanSholat(2, 0), (l, ri) => {
  const n = TASBIH_N[l.label];
  const r: Langkah[] = [n ? { ...l, note: `${l.note}, lalu ${n}x Subhaanallaah…`, tip: `${l.label === 'Surah pendek' ? 'Setelah membaca surah, masih berdiri' : 'Setelah bacaan biasanya'}, baca tasbih ${n} kali: ${TASBIH_LATIN}.` } : l];
  if (l.label === 'Sujud kedua') r.push({
    label: ri === 0 ? 'Duduk istirahat' : 'Duduk sebelum tasyahud', posture: 'duduk', note: '10x Subhaanallaah…', baca: TASBIH,
    tip: `${ri === 0 ? 'Sebelum bangkit ke rakaat berikutnya' : 'Sebelum membaca tasyahud'}, duduk sebentar dan baca tasbih 10 kali. Jumlah tasbih satu rakaat menjadi 75.`,
  });
  return r;
});

const SALAM = MATERIALS.find((m) => m.slug === 'salam')!;
const DOA_JENAZAH: Reading[] = [
  { title: 'Doa Setelah Takbir Ketiga (jenazah laki-laki)', arabic: 'اَللّٰهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ', latin: 'Allaahummaghfir lahuu warhamhu wa ’aafihi wa’fu ’anhu.', meaning: 'Ya Allah, ampunilah dia, rahmatilah dia, selamatkanlah dia, dan maafkanlah dia. (Untuk perempuan: lahaa, warhamhaa, wa ’aafihaa, wa’fu ’anhaa.)' },
  { title: 'Doa Setelah Takbir Keempat (jenazah laki-laki)', arabic: 'اَللّٰهُمَّ لَا تَحْرِمْنَا أَجْرَهُ وَلَا تَفْتِنَّا بَعْدَهُ وَاغْفِرْ لَنَا وَلَهُ', latin: 'Allaahumma laa tahrimnaa ajrahuu wa laa taftinnaa ba’dahuu waghfir lanaa wa lahu.', meaning: 'Ya Allah, jangan Engkau halangi kami dari pahalanya, jangan beri kami fitnah sepeninggalnya, dan ampunilah kami dan dia. (Untuk perempuan: ajrahaa, ba’dahaa, wa lahaa.)' },
];
const takbirJenazah = (ke: string, lalu: string): Langkah => ({ label: `Takbir ${ke}`, posture: 'takbir', note: lalu, tip: `Angkat kedua tangan sambil mengucap “Allaahu Akbar”, lalu bersedekap kembali dan ${lalu}.` });
const urutanJenazah = (): Langkah[][] => [[
  { label: 'Niat & berdiri tegak', posture: 'niat', note: 'niat di dalam hati' },
  takbirJenazah('pertama', 'membaca Al-Fatihah'),
  { label: 'Al-Fatihah', posture: 'sedekap', note: 'dibaca pelan' },
  takbirJenazah('kedua', 'membaca sholawat'),
  { label: 'Sholawat', posture: 'sedekap', note: 'sholawat Ibrahimiyah', baca: SALAM.extra![1], tip: 'Bacalah sholawat Ibrahimiyah seperti pada tasyahud akhir, sambil tetap berdiri bersedekap.' },
  takbirJenazah('ketiga', 'mendoakan jenazah'),
  { label: 'Doa untuk jenazah', posture: 'sedekap', note: 'mendoakan jenazah', baca: DOA_JENAZAH[0], tip: 'Doakan jenazah agar diampuni dan dirahmati Allah. Untuk jenazah perempuan, kata “hu” diganti “haa”.' },
  takbirJenazah('keempat', 'berdoa untuk jenazah dan diri kita'),
  { label: 'Doa setelah takbir keempat', posture: 'sedekap', note: 'doa penutup', baca: DOA_JENAZAH[1], tip: 'Berdoa untuk jenazah dan untuk kita semua.' },
  { label: 'Salam', posture: 'niat', note: 'sambil tetap berdiri', baca: SALAM, tip: 'Masih berdiri, menoleh ke kanan lalu ke kiri sambil mengucap salam. Sholat jenazah tidak ada rukuk, sujud, maupun duduk.' },
]];

/** Urutan gerakan sholat s untuk niat ke-i. */
export const urutanOf = (s: SholatLain, i: number) => s.urutan?.(i) ?? urutanSholat(2, s.jahr ?? 0);
/** Nama sholat untuk mode belajar, dari judul niat: “Niat Sholat Dhuha” → “Dhuha”. */
export const namaDariNiat = (n: Reading) => n.title.replace(/^Niat (Sholat )?/, '');

// Niat qadha = niat fardhu yang sudah ada, kata “adaa’an” (tepat waktu) diganti “qadhaa’an” (mengganti).
const NIAT_FARDHU = WAKTU.map((w) => (w.name === 'Subuh' ? MATERIALS[0] : MATERIALS[0].extra!.find((e) => e.title.endsWith(w.name))!));
const NIAT_QADHA: Reading[] = NIAT_FARDHU.map((n, i) => ({
  title: `Niat Sholat Qadha ${WAKTU[i].name}`,
  arabic: n.arabic.replace('أَدَاءً', 'قَضَاءً'),
  latin: n.latin.replace('adaa’an', 'qadhaa’an'),
  meaning: n.meaning.replace('Aku berniat sholat fardhu', 'Aku berniat mengqadha sholat fardhu'),
}));

export const SHOLAT_LAIN: SholatLain[] = [
  {
    slug: 'rawatib', name: 'Sholat Rawatib', kategori: 'Sunnah Rawatib',
    hukum: 'Sunnah (sebagian muakkad: sangat dianjurkan)', rakaat: '2 rakaat setiap kali', color: 'from-emerald-400 to-teal-500',
    waktu: 'Qabliyah: sebelum sholat fardhu. Ba’diyah: sesudah sholat fardhu.',
    desc: 'Sholat sunnah yang menemani sholat fardhu. Yang paling dianjurkan (muakkad): 2 rakaat sebelum Subuh, 2 sebelum dan 2 sesudah Dzuhur, 2 sesudah Maghrib, dan 2 sesudah Isya.',
    niat: [
      sunnah('Niat Qabliyah Subuh', 'سُنَّةَ الصُّبْحِ رَكْعَتَيْنِ قَبْلِيَّةً', 'sunnatash-shubhi rak’ataini qabliyyatan', 'sunnah sebelum Subuh dua rakaat'),
      sunnah('Niat Qabliyah Dzuhur', 'سُنَّةَ الظُّهْرِ رَكْعَتَيْنِ قَبْلِيَّةً', 'sunnatazh-zhuhri rak’ataini qabliyyatan', 'sunnah sebelum Dzuhur dua rakaat'),
      sunnah('Niat Ba’diyah Dzuhur', 'سُنَّةَ الظُّهْرِ رَكْعَتَيْنِ بَعْدِيَّةً', 'sunnatazh-zhuhri rak’ataini ba’diyyatan', 'sunnah sesudah Dzuhur dua rakaat'),
      sunnah('Niat Qabliyah Ashar', 'سُنَّةَ الْعَصْرِ رَكْعَتَيْنِ قَبْلِيَّةً', 'sunnatal-’ashri rak’ataini qabliyyatan', 'sunnah sebelum Ashar dua rakaat'),
      sunnah('Niat Ba’diyah Maghrib', 'سُنَّةَ الْمَغْرِبِ رَكْعَتَيْنِ بَعْدِيَّةً', 'sunnatal-maghribi rak’ataini ba’diyyatan', 'sunnah sesudah Maghrib dua rakaat'),
      sunnah('Niat Ba’diyah Isya', 'سُنَّةَ الْعِشَاءِ رَكْعَتَيْنِ بَعْدِيَّةً', 'sunnatal-’isyaa’i rak’ataini ba’diyyatan', 'sunnah sesudah Isya dua rakaat'),
    ],
    cara: CARA_2,
    catatan: [
      'Tidak ada sholat sunnah sesudah Subuh dan sesudah Ashar.',
      'Qabliyah Subuh adalah rawatib yang paling utama, pahalanya lebih baik dari dunia dan isinya.',
      'Dikerjakan sendiri-sendiri (tidak berjamaah) dan semua bacaannya pelan.',
    ],
  },
  {
    slug: 'tahiyatul-masjid', name: 'Sholat Tahiyatul Masjid', kategori: 'Sunnah Harian',
    hukum: 'Sunnah', rakaat: '2 rakaat', color: 'from-sky-400 to-cyan-500',
    waktu: 'Setiap kali masuk masjid, sebelum duduk.',
    desc: 'Sholat untuk “menghormati” masjid. Rasulullah ﷺ bersabda: jika kalian masuk masjid, janganlah duduk sebelum sholat dua rakaat.',
    niat: [sunnah('Niat Tahiyatul Masjid', 'سُنَّةَ تَحِيَّةِ الْمَسْجِدِ رَكْعَتَيْنِ', 'sunnata tahiyyatil masjidi rak’ataini', 'sunnah tahiyatul masjid dua rakaat')],
    cara: CARA_2,
    catatan: ['Jika langsung ikut sholat fardhu berjamaah, tahiyatul masjid sudah tercukupi.'],
  },
  {
    slug: 'wudhu', name: 'Sholat Sunnah Wudhu', kategori: 'Sunnah Harian',
    hukum: 'Sunnah', rakaat: '2 rakaat', color: 'from-cyan-400 to-sky-500',
    waktu: 'Sesaat setelah selesai berwudhu.',
    desc: 'Sholat dua rakaat setelah berwudhu. Bilal radhiyallahu ’anhu selalu mengerjakannya, dan Rasulullah ﷺ mendengar suara langkahnya di surga.',
    niat: [sunnah('Niat Sholat Sunnah Wudhu', 'سُنَّةَ الْوُضُوْءِ رَكْعَتَيْنِ', 'sunnatal wudhuu’i rak’ataini', 'sunnah wudhu dua rakaat')],
    cara: CARA_2,
  },
  {
    slug: 'dhuha', name: 'Sholat Dhuha', kategori: 'Sunnah Harian', urutan: () => surah(urutanSholat(2, 0), [['Asy-Syams'], ['Adh-Dhuha']]),
    hukum: 'Sunnah muakkad', rakaat: 'Minimal 2, paling banyak 8 (ada yang menyebut 12)', color: 'from-amber-300 to-orange-400',
    waktu: 'Pagi hari, saat matahari sudah naik setinggi tombak (±15 menit setelah terbit) sampai sebelum waktu Dzuhur. Paling utama sekitar pukul 9–10.',
    desc: 'Sholat di waktu pagi sebagai sedekah untuk seluruh persendian tubuh, dan doa memohon rezeki yang baik dan berkah.',
    niat: [sunnah('Niat Sholat Dhuha', 'سُنَّةَ الضُّحَى رَكْعَتَيْنِ', 'sunnatadh-dhuhaa rak’ataini', 'sunnah Dhuha dua rakaat')],
    cara: [
      ...CARA_2.slice(0, 1),
      'Rakaat pertama: setelah Al-Fatihah dianjurkan membaca surah Asy-Syams (atau surah pendek lain).',
      'Rakaat kedua: setelah Al-Fatihah dianjurkan membaca surah Adh-Dhuha.',
      'Selesaikan seperti sholat dua rakaat biasa sampai salam.',
      'Jika ingin lebih dari 2 rakaat, ulangi dengan salam setiap 2 rakaat.',
      'Setelah selesai, bacalah doa sholat Dhuha.',
    ],
    doa: [{
      title: 'Doa Setelah Sholat Dhuha',
      arabic: 'اَللّٰهُمَّ إِنَّ الضُّحَاءَ ضُحَاؤُكَ، وَالْبَهَاءَ بَهَاؤُكَ، وَالْجَمَالَ جَمَالُكَ، وَالْقُوَّةَ قُوَّتُكَ، وَالْقُدْرَةَ قُدْرَتُكَ، وَالْعِصْمَةَ عِصْمَتُكَ. اَللّٰهُمَّ إِنْ كَانَ رِزْقِيْ فِي السَّمَاءِ فَأَنْزِلْهُ، وَإِنْ كَانَ فِي الْأَرْضِ فَأَخْرِجْهُ، وَإِنْ كَانَ مُعْسِرًا فَيَسِّرْهُ، وَإِنْ كَانَ حَرَامًا فَطَهِّرْهُ، وَإِنْ كَانَ بَعِيْدًا فَقَرِّبْهُ، بِحَقِّ ضُحَائِكَ وَبَهَائِكَ وَجَمَالِكَ وَقُوَّتِكَ وَقُدْرَتِكَ، آتِنِيْ مَا آتَيْتَ عِبَادَكَ الصَّالِحِيْنَ',
      latin: 'Allaahumma innadh-dhuhaa’a dhuhaa’uka, wal bahaa’a bahaa’uka, wal jamaala jamaaluka, wal quwwata quwwatuka, wal qudrata qudratuka, wal ’ishmata ’ishmatuka. Allaahumma in kaana rizqii fis-samaa’i fa anzilhu, wa in kaana fil ardhi fa akhrijhu, wa in kaana mu’siran fa yassirhu, wa in kaana haraaman fa thahhirhu, wa in kaana ba’iidan fa qarribhu, bi haqqi dhuhaa’ika wa bahaa’ika wa jamaalika wa quwwatika wa qudratika, aatinii maa aataita ’ibaadakash-shaalihiin.',
      meaning: 'Ya Allah, sesungguhnya waktu dhuha adalah waktu dhuha-Mu, keagungan adalah keagungan-Mu, keindahan adalah keindahan-Mu, kekuatan adalah kekuatan-Mu, kekuasaan adalah kekuasaan-Mu, dan penjagaan adalah penjagaan-Mu. Ya Allah, jika rezekiku di langit turunkanlah, jika di bumi keluarkanlah, jika sulit mudahkanlah, jika haram sucikanlah, jika jauh dekatkanlah. Dengan kebenaran dhuha, keagungan, keindahan, kekuatan, dan kekuasaan-Mu, berikanlah kepadaku apa yang Engkau berikan kepada hamba-hamba-Mu yang saleh.',
    }, SURAH['Asy-Syams'], SURAH['Adh-Dhuha']],
  },
  {
    slug: 'istikharah', name: 'Sholat Istikharah', kategori: 'Sunnah Harian',
    hukum: 'Sunnah', rakaat: '2 rakaat', color: 'from-teal-400 to-emerald-500',
    waktu: 'Kapan saja di luar waktu terlarang, paling baik di sepertiga malam terakhir.',
    desc: 'Sholat untuk meminta petunjuk Allah saat harus memilih atau bingung mengambil keputusan.',
    niat: [sunnah('Niat Sholat Istikharah', 'سُنَّةَ الْاِسْتِخَارَةِ رَكْعَتَيْنِ', 'sunnatal istikhaarati rak’ataini', 'sunnah Istikharah dua rakaat')],
    cara: [...CARA_2, 'Setelah salam, baca doa istikharah dan sebutkan urusan yang ingin dipilih pada kata “hādzal amra” (urusan ini).'],
    doa: [{
      title: 'Doa Istikharah',
      arabic: 'اَللّٰهُمَّ إِنِّيْ أَسْتَخِيْرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيْمِ، فَإِنَّكَ تَقْدِرُ وَلَا أَقْدِرُ، وَتَعْلَمُ وَلَا أَعْلَمُ، وَأَنْتَ عَلَّامُ الْغُيُوْبِ. اَللّٰهُمَّ إِنْ كُنْتَ تَعْلَمُ أَنَّ هٰذَا الْأَمْرَ خَيْرٌ لِيْ فِيْ دِيْنِيْ وَمَعَاشِيْ وَعَاقِبَةِ أَمْرِيْ فَاقْدُرْهُ لِيْ وَيَسِّرْهُ لِيْ ثُمَّ بَارِكْ لِيْ فِيْهِ، وَإِنْ كُنْتَ تَعْلَمُ أَنَّ هٰذَا الْأَمْرَ شَرٌّ لِيْ فِيْ دِيْنِيْ وَمَعَاشِيْ وَعَاقِبَةِ أَمْرِيْ فَاصْرِفْهُ عَنِّيْ وَاصْرِفْنِيْ عَنْهُ، وَاقْدُرْ لِيَ الْخَيْرَ حَيْثُ كَانَ ثُمَّ أَرْضِنِيْ بِهِ',
      latin: 'Allaahumma innii astakhiiruka bi ’ilmika, wa astaqdiruka bi qudratika, wa as-aluka min fadhlikal ’azhiim, fa innaka taqdiru wa laa aqdiru, wa ta’lamu wa laa a’lamu, wa anta ’allaamul ghuyuub. Allaahumma in kunta ta’lamu anna haadzal amra khairun lii fii diinii wa ma’aasyii wa ’aaqibati amrii faqdurhu lii wa yassirhu lii tsumma baarik lii fiih. Wa in kunta ta’lamu anna haadzal amra syarrun lii fii diinii wa ma’aasyii wa ’aaqibati amrii fashrifhu ’annii washrifnii ’anhu, waqdur liyal khaira haitsu kaana tsumma ardhinii bih.',
      meaning: 'Ya Allah, aku memohon pilihan kepada-Mu dengan ilmu-Mu, memohon kekuatan dengan kekuasaan-Mu, dan memohon karunia-Mu yang agung. Engkau Maha Kuasa sedangkan aku tidak, Engkau Maha Mengetahui sedangkan aku tidak, dan Engkau Maha Mengetahui yang gaib. Ya Allah, jika Engkau tahu urusan ini baik bagiku dalam agamaku, kehidupanku, dan akhir urusanku, takdirkanlah dan mudahkanlah untukku, lalu berkahilah. Jika Engkau tahu urusan ini buruk bagiku dalam agamaku, kehidupanku, dan akhir urusanku, jauhkanlah ia dariku dan jauhkan aku darinya, takdirkanlah kebaikan untukku di mana pun adanya, lalu jadikan aku ridha dengannya.',
    }],
  },
  {
    slug: 'hajat', name: 'Sholat Hajat', kategori: 'Sunnah Harian',
    hukum: 'Sunnah', rakaat: '2 sampai 12 rakaat, salam setiap 2 rakaat', color: 'from-lime-400 to-emerald-500',
    waktu: 'Kapan saja di luar waktu terlarang, paling baik di malam hari.',
    desc: 'Sholat untuk memohon kepada Allah agar keinginan atau kebutuhan (hajat) yang baik dikabulkan, misalnya lancar ujian.',
    niat: [sunnah('Niat Sholat Hajat', 'سُنَّةَ الْحَاجَةِ رَكْعَتَيْنِ', 'sunnatal haajati rak’ataini', 'sunnah Hajat dua rakaat')],
    cara: [...CARA_2, 'Setelah salam, perbanyak istighfar dan sholawat, lalu baca doa sholat hajat dan sampaikan hajatmu.'],
    doa: [{
      title: 'Doa Sholat Hajat',
      arabic: 'لَا إِلٰهَ إِلَّا اللّٰهُ الْحَلِيْمُ الْكَرِيْمُ، سُبْحَانَ اللّٰهِ رَبِّ الْعَرْشِ الْعَظِيْمِ، اَلْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِيْنَ، أَسْأَلُكَ مُوْجِبَاتِ رَحْمَتِكَ، وَعَزَائِمَ مَغْفِرَتِكَ، وَالْغَنِيْمَةَ مِنْ كُلِّ بِرٍّ، وَالسَّلَامَةَ مِنْ كُلِّ إِثْمٍ، لَا تَدَعْ لِيْ ذَنْبًا إِلَّا غَفَرْتَهُ، وَلَا هَمًّا إِلَّا فَرَّجْتَهُ، وَلَا حَاجَةً هِيَ لَكَ رِضًا إِلَّا قَضَيْتَهَا يَا أَرْحَمَ الرَّاحِمِيْنَ',
      latin: 'Laa ilaaha illallaahul haliimul kariim, subhaanallaahi rabbil ’arsyil ’azhiim, alhamdu lillaahi rabbil ’aalamiin. As-aluka muujibaati rahmatik, wa ’azaa-ima maghfiratik, wal ghaniimata min kulli birr, was salaamata min kulli itsm. Laa tada’ lii dzanban illaa ghafartah, wa laa hamman illaa farrajtah, wa laa haajatan hiya laka ridhan illaa qadhaitahaa, yaa arhamar raahimiin.',
      meaning: 'Tiada Tuhan selain Allah Yang Maha Penyantun lagi Maha Mulia. Maha Suci Allah, Tuhan Arsy yang agung. Segala puji bagi Allah, Tuhan semesta alam. Aku memohon kepada-Mu hal-hal yang mendatangkan rahmat-Mu, ampunan-Mu, keuntungan dari setiap kebaikan, dan keselamatan dari setiap dosa. Jangan Engkau biarkan dosaku kecuali Engkau ampuni, kesusahanku kecuali Engkau beri jalan keluar, dan hajat yang Engkau ridhai kecuali Engkau kabulkan, wahai Yang Maha Penyayang.',
    }],
  },
  {
    slug: 'taubat', name: 'Sholat Taubat', kategori: 'Sunnah Harian',
    hukum: 'Sunnah', rakaat: '2 rakaat', color: 'from-indigo-300 to-sky-400',
    waktu: 'Kapan saja setelah berbuat salah atau dosa, di luar waktu terlarang.',
    desc: 'Sholat untuk memohon ampunan Allah setelah berbuat salah, disertai menyesal dan berjanji tidak mengulanginya.',
    niat: [sunnah('Niat Sholat Taubat', 'سُنَّةَ التَّوْبَةِ رَكْعَتَيْنِ', 'sunnatat taubati rak’ataini', 'sunnah Taubat dua rakaat')],
    cara: [...CARA_2, 'Setelah salam, perbanyak istighfar dengan sungguh-sungguh dan menyesali kesalahan.'],
    doa: [{
      title: 'Istighfar',
      arabic: 'أَسْتَغْفِرُ اللّٰهَ الْعَظِيْمَ الَّذِيْ لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّوْمُ وَأَتُوْبُ إِلَيْهِ',
      latin: 'Astaghfirullaahal ’azhiimal ladzii laa ilaaha illaa huwal hayyul qayyuumu wa atuubu ilaih.',
      meaning: 'Aku memohon ampun kepada Allah Yang Maha Agung, tiada Tuhan selain Dia Yang Maha Hidup lagi terus-menerus mengurus makhluk-Nya, dan aku bertaubat kepada-Nya.',
    }],
    catatan: ['Syarat taubat: menyesal, berhenti dari kesalahan, dan berniat tidak mengulanginya. Jika bersalah kepada orang lain, minta maaflah kepadanya.'],
  },
  {
    slug: 'tahajud', name: 'Sholat Tahajud', kategori: 'Sunnah Malam',
    hukum: 'Sunnah muakkad', rakaat: 'Minimal 2, tidak dibatasi (salam setiap 2 rakaat)', color: 'from-violet-500 to-indigo-600',
    waktu: 'Malam hari setelah Isya dan setelah tidur, sampai sebelum Subuh. Paling utama di sepertiga malam terakhir.',
    desc: 'Sholat malam yang paling utama setelah sholat fardhu. Dikerjakan setelah bangun tidur, saat Allah turun ke langit dunia dan mengabulkan doa.',
    niat: [sunnah('Niat Sholat Tahajud', 'سُنَّةَ التَّهَجُّدِ رَكْعَتَيْنِ', 'sunnatat tahajjudi rak’ataini', 'sunnah Tahajud dua rakaat')],
    cara: [
      'Tidur terlebih dahulu setelah Isya, lalu bangun di malam hari dan berwudhu.',
      ...CARA_2,
      'Boleh diulang dengan salam setiap 2 rakaat, lalu ditutup dengan sholat Witir.',
      'Setelah selesai, baca doa tahajud dan berdoa sesuai keinginan.',
    ],
    doa: [{
      title: 'Doa Setelah Sholat Tahajud',
      arabic: 'اَللّٰهُمَّ لَكَ الْحَمْدُ أَنْتَ قَيِّمُ السَّمٰوَاتِ وَالْأَرْضِ وَمَنْ فِيْهِنَّ، وَلَكَ الْحَمْدُ لَكَ مُلْكُ السَّمٰوَاتِ وَالْأَرْضِ وَمَنْ فِيْهِنَّ، وَلَكَ الْحَمْدُ أَنْتَ نُوْرُ السَّمٰوَاتِ وَالْأَرْضِ، وَلَكَ الْحَمْدُ أَنْتَ الْحَقُّ، وَوَعْدُكَ الْحَقُّ، وَلِقَاؤُكَ حَقٌّ، وَقَوْلُكَ حَقٌّ، وَالْجَنَّةُ حَقٌّ، وَالنَّارُ حَقٌّ، وَالنَّبِيُّوْنَ حَقٌّ، وَمُحَمَّدٌ حَقٌّ، وَالسَّاعَةُ حَقٌّ. اَللّٰهُمَّ لَكَ أَسْلَمْتُ، وَبِكَ آمَنْتُ، وَعَلَيْكَ تَوَكَّلْتُ، وَإِلَيْكَ أَنَبْتُ، وَبِكَ خَاصَمْتُ، وَإِلَيْكَ حَاكَمْتُ، فَاغْفِرْ لِيْ مَا قَدَّمْتُ وَمَا أَخَّرْتُ، وَمَا أَسْرَرْتُ وَمَا أَعْلَنْتُ، أَنْتَ الْمُقَدِّمُ وَأَنْتَ الْمُؤَخِّرُ، لَا إِلٰهَ إِلَّا أَنْتَ',
      latin: 'Allaahumma lakal hamdu anta qayyimus samaawaati wal ardhi wa man fiihinn, wa lakal hamdu laka mulkus samaawaati wal ardhi wa man fiihinn, wa lakal hamdu anta nuurus samaawaati wal ardh, wa lakal hamdu antal haqq, wa wa’dukal haqq, wa liqaa’uka haqq, wa qauluka haqq, wal jannatu haqq, wan naaru haqq, wan nabiyyuuna haqq, wa Muhammadun haqq, was saa’atu haqq. Allaahumma laka aslamtu, wa bika aamantu, wa ’alaika tawakkaltu, wa ilaika anabtu, wa bika khaashamtu, wa ilaika haakamtu, faghfir lii maa qaddamtu wa maa akhkhartu, wa maa asrartu wa maa a’lantu, antal muqaddimu wa antal mu-akhkhiru, laa ilaaha illaa anta.',
      meaning: 'Ya Allah, bagi-Mu segala puji, Engkau pengatur langit, bumi, dan isinya. Bagi-Mu segala puji, milik-Mu kerajaan langit, bumi, dan isinya. Bagi-Mu segala puji, Engkau cahaya langit dan bumi. Bagi-Mu segala puji, Engkau Maha Benar, janji-Mu benar, pertemuan dengan-Mu benar, firman-Mu benar, surga benar, neraka benar, para nabi benar, Muhammad benar, dan hari kiamat benar. Ya Allah, kepada-Mu aku berserah diri, kepada-Mu aku beriman, kepada-Mu aku bertawakal, kepada-Mu aku kembali. Ampunilah dosaku yang telah lalu dan yang akan datang, yang tersembunyi dan yang tampak. Engkau yang mendahulukan dan mengakhirkan, tiada Tuhan selain Engkau.',
    }],
    catatan: ['Jika sholat malam tanpa tidur terlebih dahulu, namanya sholat malam (qiyamul lail) biasa, tetap berpahala.'],
  },
  {
    slug: 'witir', name: 'Sholat Witir', kategori: 'Sunnah Malam',
    urutan: (i) => surah(urutanSholat(i === 0 ? 2 : 1, 0), i === 0 ? [['Al-A’la'], ['Al-Kafirun']] : [['Al-Ikhlas', 'Al-Falaq', 'An-Nas']]),
    hukum: 'Sunnah muakkad', rakaat: 'Ganjil: 1, 3, 5, sampai 11 rakaat', color: 'from-indigo-500 to-purple-600',
    waktu: 'Setelah Isya sampai sebelum Subuh. Dijadikan sholat penutup di malam hari.',
    desc: 'Witir artinya ganjil. Sholat ini menjadi penutup sholat malam, setelah tarawih atau tahajud.',
    niat: [
      sunnah('Niat Witir 2 Rakaat (bagian dari 3 rakaat)', 'سُنَّةً مِنَ الْوِتْرِ رَكْعَتَيْنِ', 'sunnatan minal witri rak’ataini', 'sunnah sebagian dari Witir dua rakaat'),
      sunnah('Niat Witir 1 Rakaat', 'سُنَّةَ الْوِتْرِ رَكْعَةً', 'sunnatal witri rak’atan', 'sunnah Witir satu rakaat'),
    ],
    cara: [
      'Cara yang umum untuk 3 rakaat: sholat 2 rakaat lalu salam, kemudian sholat 1 rakaat lalu salam.',
      'Rakaat 1: setelah Al-Fatihah dianjurkan membaca surah Al-A’la.',
      'Rakaat 2: setelah Al-Fatihah dianjurkan membaca surah Al-Kafirun, lalu tasyahud akhir dan salam.',
      'Berdiri lagi dengan niat witir 1 rakaat: Al-Fatihah lalu Al-Ikhlas, Al-Falaq, dan An-Nas.',
      'Rukuk, i’tidal, dua kali sujud, lalu langsung tasyahud akhir dan salam.',
      'Boleh juga 3 rakaat sekaligus dengan satu kali tasyahud di rakaat terakhir.',
    ],
    doa: [{
      title: 'Dzikir Setelah Witir (3x)',
      arabic: 'سُبْحَانَ الْمَلِكِ الْقُدُّوْسِ',
      latin: 'Subhaanal malikil qudduus.',
      meaning: 'Maha Suci Allah, Raja Yang Maha Suci.',
    }, SURAH['Al-A’la'], SURAH['Al-Kafirun'], SURAH['Al-Falaq'], SURAH['An-Nas']],
    catatan: ['Pada separuh akhir bulan Ramadhan, di rakaat terakhir witir dianjurkan membaca doa qunut setelah i’tidal (mazhab Syafi’i).'],
  },
  {
    slug: 'tarawih', name: 'Sholat Tarawih', kategori: 'Sunnah Malam', jahr: 2,
    hukum: 'Sunnah muakkad (hanya di bulan Ramadhan)', rakaat: '8 atau 20 rakaat, salam setiap 2 rakaat, ditutup witir', color: 'from-fuchsia-400 to-purple-500',
    waktu: 'Malam bulan Ramadhan, setelah sholat Isya sampai sebelum Subuh.',
    desc: 'Sholat malam khusus bulan Ramadhan, biasanya dikerjakan berjamaah di masjid setelah sholat Isya.',
    niat: [
      sunnah('Niat Tarawih (sendiri)', 'سُنَّةَ التَّرَاوِيْحِ رَكْعَتَيْنِ', 'sunnatat taraawiihi rak’ataini', 'sunnah Tarawih dua rakaat'),
      sunnah('Niat Tarawih (makmum)', 'سُنَّةَ التَّرَاوِيْحِ رَكْعَتَيْنِ مَأْمُوْمًا', 'sunnatat taraawiihi rak’ataini ma’muuman', 'sunnah Tarawih dua rakaat sebagai makmum'),
    ],
    cara: [...CARA_2, 'Ulangi setiap 2 rakaat sampai 8 atau 20 rakaat, lalu tutup dengan sholat Witir.'],
    catatan: ['Di antara setiap dua rakaat boleh membaca dzikir atau sholawat sambil beristirahat sejenak.'],
  },
  {
    slug: 'tasbih', name: 'Sholat Tasbih', kategori: 'Sunnah Khusus', urutan: urutanTasbih,
    hukum: 'Sunnah (sebagian ulama memperselisihkan haditsnya)', rakaat: '4 rakaat (dua kali salam atau satu kali salam)', color: 'from-yellow-300 to-amber-500',
    waktu: 'Kapan saja di luar waktu terlarang. Dianjurkan sekali sehari, seminggu, sebulan, setahun, atau sekali seumur hidup.',
    desc: 'Sholat yang di dalamnya dibaca tasbih sebanyak 75 kali setiap rakaat, sehingga 300 kali untuk 4 rakaat.',
    niat: [sunnah('Niat Sholat Tasbih', 'سُنَّةَ التَّسْبِيْحِ رَكْعَتَيْنِ', 'sunnatat tasbiihi rak’ataini', 'sunnah Tasbih dua rakaat')],
    cara: [
      'Niat dan takbiratul ihram, doa iftitah, Al-Fatihah, dan surah pendek.',
      'Masih berdiri: baca tasbih 15 kali.',
      'Rukuk: setelah bacaan rukuk, baca tasbih 10 kali.',
      'I’tidal: setelah bacaan i’tidal, baca tasbih 10 kali.',
      'Sujud pertama: setelah bacaan sujud, baca tasbih 10 kali.',
      'Duduk di antara dua sujud: baca tasbih 10 kali.',
      'Sujud kedua: baca tasbih 10 kali.',
      'Duduk istirahat sebelum berdiri (atau sebelum tasyahud di rakaat kedua): baca tasbih 10 kali. Jumlahnya 75 per rakaat.',
      'Lakukan hal yang sama di setiap rakaat, lalu tasyahud dan salam.',
    ],
    doa: [TASBIH],
  },
  {
    slug: 'idul-fitri', name: 'Sholat Idul Fitri', kategori: 'Sunnah Khusus', urutan: () => takbirTambahan(surah(urutanSholat(2, 2), [['Al-A’la'], ['Al-Ghasyiyah']])),
    hukum: 'Sunnah muakkad', rakaat: '2 rakaat, berjamaah', color: 'from-emerald-400 to-green-600',
    waktu: '1 Syawal, setelah matahari terbit setinggi tombak sampai sebelum Dzuhur.',
    desc: 'Sholat hari raya setelah sebulan berpuasa Ramadhan, dikerjakan berjamaah di masjid atau lapangan lalu mendengarkan khutbah.',
    niat: [sunnah('Niat Sholat Idul Fitri (makmum)', 'سُنَّةً لِعِيْدِ الْفِطْرِ رَكْعَتَيْنِ مَأْمُوْمًا', 'sunnatan li ’iidil fithri rak’ataini ma’muuman', 'sunnah Idul Fitri dua rakaat sebagai makmum')],
    cara: [
      'Niat, takbiratul ihram, lalu doa iftitah.',
      'Rakaat 1: takbir 7 kali (selain takbiratul ihram). Di antara setiap takbir membaca tasbih.',
      'Membaca Al-Fatihah dan surah (dianjurkan Al-A’la), lalu rukuk sampai sujud kedua.',
      'Rakaat 2: saat berdiri, takbir 5 kali (selain takbir bangkit), di antaranya membaca tasbih.',
      'Membaca Al-Fatihah dan surah (dianjurkan Al-Ghasyiyah), lalu lanjutkan sampai salam.',
      'Setelah sholat, dengarkan khutbah Id.',
    ],
    doa: [{ ...TASBIH, title: 'Bacaan di Antara Takbir' }, SURAH['Al-A’la'], SURAH['Al-Ghasyiyah']],
    catatan: ['Sebelum berangkat dianjurkan makan sedikit (misalnya kurma), mandi, dan memakai pakaian terbaik.', 'Zakat fitrah ditunaikan sebelum sholat Idul Fitri.'],
  },
  {
    slug: 'idul-adha', name: 'Sholat Idul Adha', kategori: 'Sunnah Khusus', urutan: () => takbirTambahan(surah(urutanSholat(2, 2), [['Al-A’la'], ['Al-Ghasyiyah']])),
    hukum: 'Sunnah muakkad', rakaat: '2 rakaat, berjamaah', color: 'from-orange-400 to-rose-500',
    waktu: '10 Dzulhijjah, setelah matahari terbit setinggi tombak sampai sebelum Dzuhur.',
    desc: 'Sholat hari raya kurban. Setelah sholat dan khutbah, hewan kurban disembelih.',
    niat: [sunnah('Niat Sholat Idul Adha (makmum)', 'سُنَّةً لِعِيْدِ الْأَضْحَى رَكْعَتَيْنِ مَأْمُوْمًا', 'sunnatan li ’iidil adh-haa rak’ataini ma’muuman', 'sunnah Idul Adha dua rakaat sebagai makmum')],
    cara: [
      'Tata caranya sama seperti sholat Idul Fitri.',
      'Rakaat 1: takbir 7 kali setelah doa iftitah, lalu Al-Fatihah dan surah.',
      'Rakaat 2: takbir 5 kali saat berdiri, lalu Al-Fatihah dan surah, kemudian lanjut sampai salam.',
      'Setelah sholat, dengarkan khutbah Id.',
    ],
    doa: [{ ...TASBIH, title: 'Bacaan di Antara Takbir' }, SURAH['Al-A’la'], SURAH['Al-Ghasyiyah']],
    catatan: ['Berbeda dengan Idul Fitri, dianjurkan tidak makan dulu sebelum sholat Idul Adha.'],
  },
  {
    slug: 'gerhana', name: 'Sholat Gerhana', kategori: 'Sunnah Khusus', urutan: (i) => gerhana(i === 1 ? 2 : 0),
    hukum: 'Sunnah muakkad', rakaat: '2 rakaat, setiap rakaat 2 kali rukuk', color: 'from-slate-500 to-slate-700',
    waktu: 'Saat terjadi gerhana matahari (kusuf) atau gerhana bulan (khusuf) sampai gerhana selesai.',
    desc: 'Sholat ketika terjadi gerhana, sebagai tanda kebesaran Allah. Disunnahkan berjamaah lalu mendengarkan khutbah.',
    niat: [
      sunnah('Niat Gerhana Matahari (makmum)', 'سُنَّةَ الْكُسُوْفِ رَكْعَتَيْنِ مَأْمُوْمًا', 'sunnatal kusuufi rak’ataini ma’muuman', 'sunnah gerhana matahari dua rakaat sebagai makmum'),
      sunnah('Niat Gerhana Bulan (makmum)', 'سُنَّةَ الْخُسُوْفِ رَكْعَتَيْنِ مَأْمُوْمًا', 'sunnatal khusuufi rak’ataini ma’muuman', 'sunnah gerhana bulan dua rakaat sebagai makmum'),
    ],
    cara: [
      'Niat, takbiratul ihram, doa iftitah, Al-Fatihah, dan surah yang panjang.',
      'Rukuk yang lama, lalu bangkit i’tidal.',
      'Setelah i’tidal, tidak langsung sujud: baca Al-Fatihah dan surah lagi.',
      'Rukuk kedua, lalu i’tidal, kemudian sujud dua kali seperti biasa.',
      'Rakaat kedua dikerjakan sama: dua kali berdiri membaca, dua kali rukuk, lalu dua sujud.',
      'Tasyahud akhir dan salam, lalu mendengarkan khutbah.',
    ],
    catatan: ['Gerhana matahari: bacaan pelan. Gerhana bulan: bacaan keras.', 'Perbanyak dzikir, doa, istighfar, dan sedekah saat gerhana.'],
  },
  {
    slug: 'istisqa', name: 'Sholat Istisqa', kategori: 'Sunnah Khusus', urutan: () => takbirTambahan(urutanSholat(2, 2)),
    hukum: 'Sunnah muakkad', rakaat: '2 rakaat, berjamaah', color: 'from-sky-500 to-blue-600',
    waktu: 'Saat kemarau panjang dan kekurangan air, biasanya di pagi hari di lapangan.',
    desc: 'Sholat untuk memohon turunnya hujan kepada Allah ketika terjadi kemarau.',
    niat: [sunnah('Niat Sholat Istisqa (makmum)', 'سُنَّةَ الْاِسْتِسْقَاءِ رَكْعَتَيْنِ مَأْمُوْمًا', 'sunnatal istisqaa’i rak’ataini ma’muuman', 'sunnah Istisqa dua rakaat sebagai makmum')],
    cara: [
      'Tata caranya seperti sholat Id: takbir 7 kali di rakaat pertama dan 5 kali di rakaat kedua.',
      'Setelah salam, imam berkhutbah dan memperbanyak istighfar.',
      'Saat berdoa, imam membalik selendangnya dan mengangkat tangan tinggi-tinggi memohon hujan.',
    ],
    doa: [{
      title: 'Doa Memohon Hujan',
      arabic: 'اَللّٰهُمَّ اسْقِنَا غَيْثًا مُغِيْثًا مَرِيْئًا مَرِيْعًا نَافِعًا غَيْرَ ضَارٍّ عَاجِلًا غَيْرَ آجِلٍ',
      latin: 'Allaahummasqinaa ghaitsan mughiitsan marii-an marii’an naafi’an ghaira dhaarrin ’aajilan ghaira aajil.',
      meaning: 'Ya Allah, turunkanlah kepada kami hujan yang menolong, menyegarkan, menyuburkan, bermanfaat dan tidak membahayakan, segera dan tidak ditunda.',
    }],
    catatan: ['Dianjurkan bertaubat, berpuasa, dan bersedekah beberapa hari sebelum sholat istisqa.'],
  },
  {
    slug: 'jumat', name: 'Sholat Jumat', kategori: 'Sholat Wajib Lainnya', jahr: 2,
    hukum: 'Fardhu ’ain bagi laki-laki muslim yang baligh, sehat, dan tidak bepergian', rakaat: '2 rakaat, berjamaah, didahului 2 khutbah', color: 'from-green-500 to-emerald-700',
    waktu: 'Hari Jumat pada waktu Dzuhur. Bagi yang mengerjakannya, sholat Jumat menggantikan sholat Dzuhur.',
    desc: 'Sholat wajib setiap hari Jumat di masjid. Perempuan dan anak-anak boleh ikut; jika tidak ikut, mereka tetap sholat Dzuhur.',
    niat: [{
      title: 'Niat Sholat Jumat (makmum)',
      arabic: `أُصَلِّي فَرْضَ الْجُمُعَةِ رَكْعَتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً مَأْمُوْمًا ${L}`,
      latin: 'Ushallii fardhal jumu’ati rak’ataini mustaqbilal qiblati adaa’an ma’muuman lillaahi ta’aalaa.',
      meaning: 'Aku berniat sholat fardhu Jumat dua rakaat menghadap kiblat sebagai makmum karena Allah Ta’ala.',
    }],
    cara: [
      'Mandi, memakai pakaian bersih dan wangi, lalu berangkat lebih awal ke masjid.',
      'Sholat tahiyatul masjid, lalu duduk tenang mendengarkan adzan dan dua khutbah. Jangan berbicara saat khutbah.',
      'Setelah khutbah dan iqamah, sholat 2 rakaat berjamaah bersama imam. Bacaan imam keras.',
      'Setelah salam, berdzikir dan boleh sholat sunnah ba’diyah.',
    ],
  },
  {
    slug: 'jenazah', name: 'Sholat Jenazah', kategori: 'Sholat Wajib Lainnya', urutan: urutanJenazah, tanpaRakaat: true,
    hukum: 'Fardhu kifayah (cukup sebagian orang yang mengerjakan)', rakaat: '4 kali takbir, tanpa rukuk dan sujud', color: 'from-stone-400 to-slate-600',
    waktu: 'Setelah jenazah dimandikan dan dikafani, sebelum dimakamkan.',
    desc: 'Sholat untuk mendoakan saudara muslim yang meninggal dunia. Seluruhnya dikerjakan sambil berdiri.',
    niat: [
      { title: 'Niat Jenazah Laki-laki (makmum)', arabic: `أُصَلِّي عَلَى هٰذَا الْمَيِّتِ أَرْبَعَ تَكْبِيْرَاتٍ فَرْضَ كِفَايَةٍ مَأْمُوْمًا ${L}`, latin: 'Ushallii ’alaa haadzal mayyiti arba’a takbiiraatin fardha kifaayatin ma’muuman lillaahi ta’aalaa.', meaning: 'Aku berniat sholat atas jenazah laki-laki ini empat takbir, fardhu kifayah, sebagai makmum karena Allah Ta’ala.' },
      { title: 'Niat Jenazah Perempuan (makmum)', arabic: `أُصَلِّي عَلَى هٰذِهِ الْمَيِّتَةِ أَرْبَعَ تَكْبِيْرَاتٍ فَرْضَ كِفَايَةٍ مَأْمُوْمًا ${L}`, latin: 'Ushallii ’alaa haadzihil mayyitati arba’a takbiiraatin fardha kifaayatin ma’muuman lillaahi ta’aalaa.', meaning: 'Aku berniat sholat atas jenazah perempuan ini empat takbir, fardhu kifayah, sebagai makmum karena Allah Ta’ala.' },
    ],
    cara: [
      'Berdiri menghadap kiblat. Imam berdiri sejajar kepala jenazah laki-laki atau bagian tengah jenazah perempuan.',
      'Takbir pertama: membaca Al-Fatihah.',
      'Takbir kedua: membaca sholawat Ibrahimiyah.',
      'Takbir ketiga: mendoakan jenazah.',
      'Takbir keempat: berdoa untuk jenazah dan diri kita.',
      'Salam ke kanan dan ke kiri.',
    ],
    doa: DOA_JENAZAH,
  },
  {
    slug: 'qadha', name: 'Qadha Sholat', kategori: 'Qadha & Musafir', urutan: (i) => urutanSholat(WAKTU[i].rakaat, WAKTU[i].jahr),
    hukum: 'Wajib bagi sholat fardhu yang tertinggal', rakaat: 'Sama dengan sholat yang ditinggalkan', color: 'from-rose-400 to-red-500',
    waktu: 'Secepatnya, begitu ingat atau terbangun. Boleh di waktu kapan pun, termasuk setelah Subuh dan Ashar.',
    desc: 'Qadha artinya mengganti sholat fardhu yang terlewat di luar waktunya, misalnya karena ketiduran atau lupa. Rasulullah ﷺ bersabda: siapa yang lupa sholat atau tertidur, hendaklah ia sholat ketika ingat.',
    niat: NIAT_QADHA,
    cara: [
      'Berwudhu, lalu niat qadha sesuai sholat yang tertinggal (lihat niat di atas).',
      'Gerakan, bacaan, dan jumlah rakaatnya sama persis dengan sholat aslinya.',
      'Jika yang tertinggal lebih dari satu, dahulukan sesuai urutan waktunya (misalnya Subuh dulu, baru Dzuhur).',
      'Jika qadha dikerjakan saat sudah masuk waktu sholat lain, kerjakan qadha dulu, kecuali waktu sholat yang sekarang hampir habis.',
    ],
    catatan: [
      'Menurut mazhab Syafi’i: qadha di malam hari bacaannya dikeraskan, di siang hari dipelankan.',
      'Sengaja meninggalkan sholat adalah dosa besar. Wajib qadha dan juga bertaubat.',
      'Perempuan yang haid atau nifas tidak perlu mengqadha sholat yang ditinggalkan selama haid atau nifas.',
    ],
  },
  {
    slug: 'jamak-qashar', name: 'Sholat Jamak & Qashar', kategori: 'Qadha & Musafir',
    hukum: 'Keringanan (rukhshah) bagi musafir', rakaat: 'Qashar: sholat 4 rakaat diringkas menjadi 2', color: 'from-blue-400 to-indigo-500',
    waktu: 'Saat bepergian jauh (±80 km atau lebih) untuk tujuan yang baik.',
    desc: 'Jamak = menggabungkan dua sholat dalam satu waktu (Dzuhur dengan Ashar, Maghrib dengan Isya). Qashar = meringkas sholat 4 rakaat (Dzuhur, Ashar, Isya) menjadi 2 rakaat. Subuh dan Maghrib tidak bisa diqashar.',
    niat: [
      { title: 'Niat Dzuhur Jamak Taqdim + Qashar', arabic: `أُصَلِّي فَرْضَ الظُّهْرِ رَكْعَتَيْنِ قَصْرًا مَجْمُوْعًا إِلَيْهِ الْعَصْرُ جَمْعَ تَقْدِيْمٍ ${L}`, latin: 'Ushallii fardhazh-zhuhri rak’ataini qashran majmuu’an ilaihil ’ashru jam’a taqdiimin lillaahi ta’aalaa.', meaning: 'Aku berniat sholat fardhu Dzuhur dua rakaat diqashar, digabung dengan Ashar dengan jamak taqdim, karena Allah Ta’ala.' },
      { title: 'Niat Ashar Qashar (setelah Dzuhur)', arabic: `أُصَلِّي فَرْضَ الْعَصْرِ رَكْعَتَيْنِ قَصْرًا ${L}`, latin: 'Ushallii fardhal-’ashri rak’ataini qashran lillaahi ta’aalaa.', meaning: 'Aku berniat sholat fardhu Ashar dua rakaat diqashar karena Allah Ta’ala.' },
    ],
    cara: [
      'Jamak taqdim: dua sholat dikerjakan di waktu sholat yang pertama (Dzuhur + Ashar di waktu Dzuhur).',
      'Jamak ta’khir: dua sholat dikerjakan di waktu sholat yang kedua (Dzuhur + Ashar di waktu Ashar).',
      'Kerjakan sholat pertama sampai salam, lalu langsung sholat kedua tanpa jeda lama.',
      'Jika diqashar, sholat 4 rakaat cukup dikerjakan 2 rakaat dengan satu tasyahud lalu salam.',
    ],
    catatan: ['Maghrib tetap 3 rakaat, tetapi boleh dijamak dengan Isya (Isya boleh diqashar 2 rakaat).', 'Untuk jamak ta’khir, niat pada sholat Dzuhur diganti “jam’a ta’khiirin”.'],
  },
];
