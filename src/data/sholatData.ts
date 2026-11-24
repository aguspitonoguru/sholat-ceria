// Data awal materi, kuis, dan kelas. Bentuknya sama dengan tabel Supabase (lihat supabase/schema.sql).

export type Posture = 'niat' | 'takbir' | 'sedekap' | 'rukuk' | 'itidal' | 'sujud' | 'duduk' | 'salam';

export type Material = {
  id: number;
  slug: Posture;
  title: string;
  shortTitle: string;
  points: string[];
  tip: string;
  arabic: string;
  latin: string;
  meaning: string;
  /** URL mp3 (64–96 kbps). Beberapa URL dipisah spasi diputar berurutan. Kosong = suara pembaca otomatis. */
  audioUrl: string;
};

export const MATERIALS: Material[] = [
  {
    id: 1,
    slug: 'niat',
    title: 'Niat & Berdiri Tegak',
    shortTitle: 'Niat',
    points: ['Berdiri tegak menghadap kiblat', 'Kedua tangan lurus di samping badan', 'Pandangan ke tempat sujud'],
    tip: 'Berdiri tenang di atas sajadah, kedua kaki sejajar, tangan santai di samping badan.',
    arabic: 'أُصَلِّي فَرْضَ الصُّبْحِ رَكْعَتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلّٰهِ تَعَالَى',
    latin: 'Ushallii fardhash-shubhi rak’ataini mustaqbilal qiblati adaa’an lillaahi ta’aalaa.',
    meaning: 'Aku berniat sholat fardhu Subuh dua rakaat menghadap kiblat karena Allah Ta’ala.',
    audioUrl: '',
  },
  {
    id: 2,
    slug: 'takbir',
    title: 'Takbiratul Ihram',
    shortTitle: 'Takbir',
    points: ['Angkat kedua tangan sejajar telinga/bahu', 'Telapak tangan menghadap kiblat', 'Turunkan lalu bersedekap di dada'],
    tip: 'Angkat kedua telapak tangan sejajar telinga sambil mengucap Allahu Akbar, lalu bersedekap.',
    arabic: 'اَللّٰهُ أَكْبَرُ',
    latin: 'Allaahu Akbar.',
    meaning: 'Allah Maha Besar.',
    audioUrl: '',
  },
  {
    id: 3,
    slug: 'sedekap',
    title: 'Doa Iftitah & Al-Fatihah',
    shortTitle: 'Al-Fatihah',
    points: ['Tangan kanan di atas tangan kiri', 'Diletakkan di atas dada/perut', 'Membaca dengan tenang'],
    tip: 'Berdiri tegak, tangan kanan di atas tangan kiri di dada, lalu membaca doa iftitah dan Al-Fatihah.',
    arabic: 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ ۝ اَلْحَمْدُ لِلّٰهِ رَبِّ الْعٰلَمِيْنَ',
    latin: 'Bismillaahir-rahmaanir-rahiim. Alhamdu lillaahi rabbil-‘aalamiin...',
    meaning: 'Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang. Segala puji bagi Allah, Tuhan seluruh alam...',
    audioUrl: 'https://everyayah.com/data/Alafasy_64kbps/001001.mp3 https://everyayah.com/data/Alafasy_64kbps/001002.mp3',
  },
  {
    id: 4,
    slug: 'rukuk',
    title: 'Rukuk',
    shortTitle: 'Rukuk',
    points: ['Punggung & kepala lurus rata 90°', 'Kedua lutut lurus', 'Telapak tangan menggenggam lutut'],
    tip: 'Membungkuk sampai punggung dan kepala lurus rata, kedua tangan memegang lutut dengan kuat.',
    arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيْمِ وَبِحَمْدِهِ',
    latin: 'Subhaana rabbiyal-‘azhiimi wa bihamdih (3x).',
    meaning: 'Maha Suci Tuhanku Yang Maha Agung dan segala puji bagi-Nya.',
    audioUrl: '',
  },
  {
    id: 5,
    slug: 'itidal',
    title: 'I’tidal',
    shortTitle: 'I’tidal',
    points: ['Bangkit dari rukuk', 'Tangan terangkat sejajar bahu/telinga', 'Berdiri tegak, tangan lurus di samping'],
    tip: 'Bangkit berdiri tegak sambil mengangkat kedua tangan, lalu turunkan lurus di samping badan.',
    arabic: 'سَمِعَ اللّٰهُ لِمَنْ حَمِدَهُ ۝ رَبَّنَا وَلَكَ الْحَمْدُ',
    latin: 'Sami’allaahu liman hamidah. Rabbanaa wa lakal-hamdu.',
    meaning: 'Allah Maha Mendengar orang yang memuji-Nya. Ya Tuhan kami, bagi-Mu segala puji.',
    audioUrl: '',
  },
  {
    id: 6,
    slug: 'sujud',
    title: 'Sujud',
    shortTitle: 'Sujud',
    points: ['Dahi & hidung menempel sajadah', 'Kedua telapak tangan di samping kepala', 'Lutut & ujung jari kaki menempel'],
    tip: 'Dahi, hidung, kedua telapak tangan, kedua lutut, dan ujung jari kaki menempel di sajadah.',
    arabic: 'سُبْحَانَ رَبِّيَ الْأَعْلٰى وَبِحَمْدِهِ',
    latin: 'Subhaana rabbiyal-a’laa wa bihamdih (3x).',
    meaning: 'Maha Suci Tuhanku Yang Maha Tinggi dan segala puji bagi-Nya.',
    audioUrl: '',
  },
  {
    id: 7,
    slug: 'duduk',
    title: 'Duduk di Antara Dua Sujud',
    shortTitle: 'Duduk',
    points: ['Duduk iftirasy di atas kaki kiri', 'Telapak kaki kanan ditegakkan', 'Tangan di atas paha dekat lutut'],
    tip: 'Duduk tegak di atas telapak kaki kiri, kaki kanan ditegakkan dengan jari menghadap kiblat.',
    arabic: 'رَبِّ اغْفِرْ لِيْ وَارْحَمْنِيْ وَاجْبُرْنِيْ وَارْفَعْنِيْ وَارْزُقْنِيْ وَاهْدِنِيْ',
    latin: 'Rabbighfirlii warhamnii wajburnii warfa’nii warzuqnii wahdinii.',
    meaning: 'Ya Tuhanku, ampunilah aku, sayangilah aku, cukupkanlah aku, angkatlah derajatku, berilah aku rezeki, dan berilah aku petunjuk.',
    audioUrl: '',
  },
  {
    id: 8,
    slug: 'salam',
    title: 'Tasyahud Akhir & Salam',
    shortTitle: 'Salam',
    points: ['Duduk tawarruk', 'Telunjuk kanan terangkat', 'Menoleh ke kanan lalu ke kiri'],
    tip: 'Angkat telunjuk kanan saat tasyahud, lalu menoleh ke kanan dan ke kiri sambil mengucap salam.',
    arabic: 'اَلسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللّٰهِ',
    latin: 'Assalaamu ‘alaikum wa rahmatullaah.',
    meaning: 'Semoga keselamatan dan rahmat Allah tercurah untuk kalian.',
    audioUrl: '',
  },
];

export type QuizQuestion = {
  posture: Posture;
  view: 'front' | 'side' | 'back';
  question: string;
  options: string[];
  answer: number;
};

export const QUIZ: QuizQuestion[] = [
  { posture: 'rukuk', view: 'side', question: 'Punggung lurus rata dan tangan memegang lutut. Gerakan apakah ini?', options: ['Takbiratul Ihram', 'Rukuk', 'Sujud', 'I’tidal'], answer: 1 },
  { posture: 'takbir', view: 'front', question: 'Mengangkat kedua tangan sejajar telinga sambil mengucap "Allahu Akbar" disebut...', options: ['Bersedekap', 'Salam', 'Takbiratul Ihram', 'I’tidal'], answer: 2 },
  { posture: 'sujud', view: 'side', question: 'Dahi, tangan, lutut, dan jari kaki menempel sajadah. Ini gerakan...', options: ['Sujud', 'Duduk', 'Rukuk', 'Niat'], answer: 0 },
  { posture: 'sedekap', view: 'front', question: 'Tangan kanan di atas tangan kiri di dada. Saat ini kita membaca...', options: ['Doa rukuk', 'Salam', 'Doa duduk', 'Al-Fatihah'], answer: 3 },
  { posture: 'itidal', view: 'side', question: 'Bangkit dari rukuk sambil membaca "Sami’allaahu liman hamidah" disebut...', options: ['Rukuk', 'I’tidal', 'Niat', 'Sujud'], answer: 1 },
  { posture: 'duduk', view: 'side', question: 'Duduk di atas kaki kiri, kaki kanan ditegakkan. Ini duduk...', options: ['Di antara dua sujud', 'Tasyahud akhir', 'Bersila', 'Rukuk'], answer: 0 },
  { posture: 'salam', view: 'front', question: 'Telunjuk terangkat lalu menoleh ke kanan dan kiri. Ini tahap...', options: ['Takbir', 'Rukuk', 'Tasyahud Akhir & Salam', 'Niat'], answer: 2 },
  { posture: 'niat', view: 'front', question: 'Berdiri tegak menghadap kiblat, tangan lurus di samping. Ini tahap...', options: ['Salam', 'Niat', 'Sujud', 'Duduk'], answer: 1 },
];

export type ClassRoom = { code: string; name: string };
export type StudentRecord = { name: string; classCode: string; completed: number; stars: number; quizScore: number };

export const DEFAULT_CLASSES: ClassRoom[] = [
  { code: 'SHOLAT-3A', name: 'Kelas 3A' },
  { code: 'SHOLAT-4A', name: 'Kelas 4A' },
];

export const DEMO_STUDENTS: StudentRecord[] = [
  { name: 'Siti', classCode: 'SHOLAT-4A', completed: 8, stars: 14, quizScore: 100 },
  { name: 'Rafa', classCode: 'SHOLAT-4A', completed: 6, stars: 9, quizScore: 75 },
  { name: 'Nabila', classCode: 'SHOLAT-3A', completed: 7, stars: 11, quizScore: 88 },
  { name: 'Farhan', classCode: 'SHOLAT-3A', completed: 3, stars: 4, quizScore: 50 },
];
