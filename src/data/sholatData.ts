// Data awal materi, kuis, dan kelas. Bentuknya sama dengan tabel Supabase (lihat supabase/schema.sql).

export type Posture = 'niat' | 'takbir' | 'sedekap' | 'rukuk' | 'itidal' | 'sujud' | 'duduk' | 'salam';

export type Reading = { title: string; arabic: string; latin: string; meaning: string };

export type Material = {
  id: number;
  slug: Posture;
  title: string;
  shortTitle: string;
  points: string[];
  tip: string;
  /** Cara melakukan, langkah demi langkah. */
  steps: string[];
  /** Hal yang perlu diperhatikan / kesalahan yang sering terjadi. */
  notes: string[];
  /** Bacaan lengkap tambahan (mis. Al-Fatihah penuh, tasyahud). */
  extra?: Reading[];
  /** Bacaan diganti (mis. niat Dzuhur, Al-Fatihah penuh): putar suara otomatis, bukan rekaman gerakan. */
  tts?: boolean;
  arabic: string;
  latin: string;
  meaning: string;
  /** URL mp3 suara laki-laki (dipakai saat belajar dengan Ali) dan perempuan (Aisyah). 64–96 kbps.
   *  Beberapa URL dipisah spasi diputar berurutan. Kosong = rekaman guru / file public/audio / suara otomatis. */
  audioAli: string;
  audioAisyah: string;
};

export const MATERIALS: Material[] = [
  {
    id: 1,
    slug: 'niat',
    title: 'Niat & Berdiri Tegak',
    shortTitle: 'Niat',
    points: ['Berdiri tegak menghadap kiblat', 'Kedua tangan lurus di samping badan', 'Pandangan ke tempat sujud'],
    tip: 'Berdiri tenang di atas sajadah, kedua kaki sejajar, tangan santai di samping badan.',
    steps: [
      'Berdiri tegak di atas sajadah menghadap kiblat.',
      'Kedua kaki dibuka kira-kira selebar bahu dan sejajar.',
      'Pandangan mata diarahkan ke tempat sujud.',
      'Berniat di dalam hati sesuai sholat yang akan dikerjakan, bersamaan dengan takbiratul ihram.',
    ],
    notes: [
      'Niat tempatnya di dalam hati. Lafaz niat boleh diucapkan pelan untuk membantu.',
      'Pastikan sudah berwudhu dan sudah masuk waktu sholat.',
      'Badan, pakaian, dan tempat sholat harus bersih dari najis.',
    ],
    extra: [
      {
        title: 'Niat Sholat Dzuhur',
        arabic: 'أُصَلِّي فَرْضَ الظُّهْرِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلّٰهِ تَعَالَى',
        latin: 'Ushallii fardhazh-zhuhri arba’a raka’aatin mustaqbilal qiblati adaa’an lillaahi ta’aalaa.',
        meaning: 'Aku berniat sholat fardhu Dzuhur empat rakaat menghadap kiblat karena Allah Ta’ala.',
      },
      {
        title: 'Niat Sholat Ashar',
        arabic: 'أُصَلِّي فَرْضَ الْعَصْرِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلّٰهِ تَعَالَى',
        latin: 'Ushallii fardhal-’ashri arba’a raka’aatin mustaqbilal qiblati adaa’an lillaahi ta’aalaa.',
        meaning: 'Aku berniat sholat fardhu Ashar empat rakaat menghadap kiblat karena Allah Ta’ala.',
      },
      {
        title: 'Niat Sholat Maghrib',
        arabic: 'أُصَلِّي فَرْضَ الْمَغْرِبِ ثَلَاثَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلّٰهِ تَعَالَى',
        latin: 'Ushallii fardhal-maghribi tsalaatsa raka’aatin mustaqbilal qiblati adaa’an lillaahi ta’aalaa.',
        meaning: 'Aku berniat sholat fardhu Maghrib tiga rakaat menghadap kiblat karena Allah Ta’ala.',
      },
      {
        title: 'Niat Sholat Isya',
        arabic: 'أُصَلِّي فَرْضَ الْعِشَاءِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلّٰهِ تَعَالَى',
        latin: 'Ushallii fardhal-’isyaa’i arba’a raka’aatin mustaqbilal qiblati adaa’an lillaahi ta’aalaa.',
        meaning: 'Aku berniat sholat fardhu Isya empat rakaat menghadap kiblat karena Allah Ta’ala.',
      },
    ],
    arabic: 'أُصَلِّي فَرْضَ الصُّبْحِ رَكْعَتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلّٰهِ تَعَالَى',
    latin: 'Ushallii fardhash-shubhi rak’ataini mustaqbilal qiblati adaa’an lillaahi ta’aalaa.',
    meaning: 'Aku berniat sholat fardhu Subuh dua rakaat menghadap kiblat karena Allah Ta’ala.',
    audioAli: '',
    audioAisyah: '',
  },
  {
    id: 2,
    slug: 'takbir',
    title: 'Takbiratul Ihram',
    shortTitle: 'Takbir',
    points: ['Angkat kedua tangan sejajar telinga/bahu', 'Telapak tangan menghadap kiblat', 'Turunkan lalu bersedekap di dada'],
    tip: 'Angkat kedua telapak tangan sejajar telinga sambil mengucap Allahu Akbar, lalu bersedekap.',
    steps: [
      'Angkat kedua tangan, ujung jari sejajar telinga dan telapak sejajar bahu.',
      'Rapatkan jari-jari, telapak tangan menghadap kiblat.',
      'Ucapkan “Allaahu Akbar” bersamaan dengan niat di dalam hati.',
      'Turunkan tangan lalu bersedekap: tangan kanan di atas tangan kiri.',
    ],
    notes: [
      'Takbiratul ihram adalah rukun pertama. Sholat dimulai sejak takbir ini.',
      'Setelah takbir tidak boleh berbicara, makan, minum, atau bercanda.',
      'Ucapkan takbir dengan jelas dan benar: “Allaahu Akbar”.',
    ],
    arabic: 'اَللّٰهُ أَكْبَرُ',
    latin: 'Allaahu Akbar.',
    meaning: 'Allah Maha Besar.',
    audioAli: '',
    audioAisyah: '',
  },
  {
    id: 3,
    slug: 'sedekap',
    title: 'Doa Iftitah & Al-Fatihah',
    shortTitle: 'Al-Fatihah',
    points: ['Tangan kanan di atas tangan kiri', 'Diletakkan di atas dada/perut', 'Membaca dengan tenang'],
    tip: 'Berdiri tegak, tangan kanan di atas tangan kiri di dada, lalu membaca doa iftitah dan Al-Fatihah.',
    steps: [
      'Letakkan tangan kanan di atas punggung tangan kiri, di antara dada dan pusar.',
      'Baca doa iftitah dengan pelan (hanya di rakaat pertama).',
      'Baca surah Al-Fatihah dengan tartil, lalu ucapkan “Aamiin”.',
      'Pada rakaat pertama dan kedua, lanjutkan dengan surah pendek, misalnya Al-Ikhlas.',
    ],
    notes: [
      'Al-Fatihah wajib dibaca di setiap rakaat. Doa iftitah hukumnya sunnah.',
      'Bacalah tidak terburu-buru, perhatikan panjang pendek bacaan.',
      'Pada rakaat ketiga dan keempat cukup membaca Al-Fatihah saja.',
    ],
    extra: [
      {
        title: 'Doa Iftitah (bagian awal)',
        arabic: 'اَللّٰهُ أَكْبَرُ كَبِيْرًا وَالْحَمْدُ لِلّٰهِ كَثِيْرًا وَسُبْحَانَ اللّٰهِ بُكْرَةً وَأَصِيْلًا',
        latin: 'Allaahu akbar kabiiraa, walhamdu lillaahi katsiiraa, wa subhaanallaahi bukratan wa ashiilaa.',
        meaning: 'Allah Maha Besar sebesar-besarnya, segala puji bagi Allah sebanyak-banyaknya, Maha Suci Allah di waktu pagi dan petang.',
      },
      {
        title: 'Surah Al-Fatihah (7 ayat)',
        arabic: 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ ۝ اَلْحَمْدُ لِلّٰهِ رَبِّ الْعٰلَمِيْنَ ۝ الرَّحْمٰنِ الرَّحِيْمِ ۝ مٰلِكِ يَوْمِ الدِّيْنِ ۝ اِيَّاكَ نَعْبُدُ وَاِيَّاكَ نَسْتَعِيْنُ ۝ اِهْدِنَا الصِّرَاطَ الْمُسْتَقِيْمَ ۝ صِرَاطَ الَّذِيْنَ اَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوْبِ عَلَيْهِمْ وَلَا الضَّاۤلِّيْنَ',
        latin: 'Bismillaahir-rahmaanir-rahiim. Alhamdu lillaahi rabbil-’aalamiin. Ar-rahmaanir-rahiim. Maaliki yaumid-diin. Iyyaaka na’budu wa iyyaaka nasta’iin. Ihdinash-shiraathal-mustaqiim. Shiraathal-ladziina an’amta ’alaihim ghairil-maghdhuubi ’alaihim wa ladh-dhaalliin.',
        meaning: 'Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang. Segala puji bagi Allah, Tuhan seluruh alam. Yang Maha Pengasih lagi Maha Penyayang. Pemilik hari pembalasan. Hanya kepada-Mu kami menyembah dan hanya kepada-Mu kami memohon pertolongan. Tunjukilah kami jalan yang lurus, yaitu jalan orang-orang yang Engkau beri nikmat, bukan jalan mereka yang dimurkai dan bukan pula jalan mereka yang sesat.',
      },
      {
        title: 'Surah Al-Ikhlas (surah pendek)',
        arabic: 'قُلْ هُوَ اللّٰهُ اَحَدٌ ۝ اَللّٰهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُوْلَدْ ۝ وَلَمْ يَكُنْ لَّهٗ كُفُوًا اَحَدٌ',
        latin: 'Qul huwallaahu ahad. Allaahush-shamad. Lam yalid wa lam yuulad. Wa lam yakul lahuu kufuwan ahad.',
        meaning: 'Katakanlah: Dialah Allah Yang Maha Esa. Allah tempat bergantung segala sesuatu. Dia tidak beranak dan tidak pula diperanakkan. Dan tidak ada sesuatu pun yang setara dengan Dia.',
      },
    ],
    arabic: 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ ۝ اَلْحَمْدُ لِلّٰهِ رَبِّ الْعٰلَمِيْنَ',
    latin: 'Bismillaahir-rahmaanir-rahiim. Alhamdu lillaahi rabbil-‘aalamiin...',
    meaning: 'Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang. Segala puji bagi Allah, Tuhan seluruh alam...',
    audioAisyah: '',
    audioAli: '',
  },
  {
    id: 4,
    slug: 'rukuk',
    title: 'Rukuk',
    shortTitle: 'Rukuk',
    points: ['Punggung & kepala lurus rata 90°', 'Kedua lutut lurus', 'Telapak tangan menggenggam lutut'],
    tip: 'Membungkuk sampai punggung dan kepala lurus rata, kedua tangan memegang lutut dengan kuat.',
    steps: [
      'Ucapkan “Allaahu Akbar” sambil mengangkat kedua tangan sejajar telinga.',
      'Bungkukkan badan sampai punggung dan kepala lurus rata.',
      'Kedua telapak tangan memegang lutut, jari-jari sedikit direnggangkan.',
      'Diam sejenak dengan tenang (tuma’ninah), lalu baca tasbih rukuk 3 kali.',
    ],
    notes: [
      'Kepala sejajar punggung: tidak terlalu menunduk dan tidak mendongak.',
      'Lutut tetap lurus, tidak ditekuk.',
      'Tuma’ninah artinya tenang sejenak, tidak terburu-buru.',
    ],
    arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيْمِ وَبِحَمْدِهِ',
    latin: 'Subhaana rabbiyal-‘azhiimi wa bihamdih (3x).',
    meaning: 'Maha Suci Tuhanku Yang Maha Agung dan segala puji bagi-Nya.',
    audioAli: '',
    audioAisyah: '',
  },
  {
    id: 5,
    slug: 'itidal',
    title: 'I’tidal',
    shortTitle: 'I’tidal',
    points: ['Bangkit dari rukuk', 'Tangan terangkat sejajar bahu/telinga', 'Berdiri tegak, tangan lurus di samping'],
    tip: 'Bangkit berdiri tegak sambil mengangkat kedua tangan, lalu turunkan lurus di samping badan.',
    steps: [
      'Bangkit dari rukuk sambil mengangkat kedua tangan sejajar telinga.',
      'Saat bangkit, ucapkan “Sami’allaahu liman hamidah”.',
      'Berdiri tegak, lalu turunkan tangan lurus di samping badan.',
      'Setelah tegak, baca “Rabbanaa wa lakal-hamdu” dengan tenang.',
    ],
    notes: [
      'Berdiri tegak sempurna dulu sebelum turun untuk sujud.',
      'Tuma’ninah sejenak, jangan langsung sujud.',
      'Pandangan tetap ke tempat sujud.',
    ],
    arabic: 'سَمِعَ اللّٰهُ لِمَنْ حَمِدَهُ ۝ رَبَّنَا وَلَكَ الْحَمْدُ',
    latin: 'Sami’allaahu liman hamidah. Rabbanaa wa lakal-hamdu.',
    meaning: 'Allah Maha Mendengar orang yang memuji-Nya. Ya Tuhan kami, bagi-Mu segala puji.',
    audioAli: '',
    audioAisyah: '',
  },
  {
    id: 6,
    slug: 'sujud',
    title: 'Sujud',
    shortTitle: 'Sujud',
    points: ['Dahi & hidung menempel sajadah', 'Kedua telapak tangan di samping kepala', 'Lutut & ujung jari kaki menempel'],
    tip: 'Dahi, hidung, kedua telapak tangan, kedua lutut, dan ujung jari kaki menempel di sajadah.',
    steps: [
      'Ucapkan “Allaahu Akbar” lalu turun untuk sujud.',
      'Letakkan kedua lutut, lalu kedua telapak tangan, kemudian dahi dan hidung.',
      'Pastikan tujuh anggota sujud menempel: dahi (bersama hidung), dua telapak tangan, dua lutut, dan ujung jari kedua kaki.',
      'Baca tasbih sujud 3 kali dengan tenang.',
    ],
    notes: [
      'Siku diangkat, tidak menempel ke lantai.',
      'Ujung jari kaki ditekuk menghadap kiblat.',
      'Sujud dilakukan dua kali dalam setiap rakaat.',
    ],
    arabic: 'سُبْحَانَ رَبِّيَ الْأَعْلٰى وَبِحَمْدِهِ',
    latin: 'Subhaana rabbiyal-a’laa wa bihamdih (3x).',
    meaning: 'Maha Suci Tuhanku Yang Maha Tinggi dan segala puji bagi-Nya.',
    audioAli: '',
    audioAisyah: '',
  },
  {
    id: 7,
    slug: 'duduk',
    title: 'Duduk di Antara Dua Sujud',
    shortTitle: 'Duduk',
    points: ['Duduk iftirasy di atas kaki kiri', 'Telapak kaki kanan ditegakkan', 'Tangan di atas paha dekat lutut'],
    tip: 'Duduk tegak di atas telapak kaki kiri, kaki kanan ditegakkan dengan jari menghadap kiblat.',
    steps: [
      'Bangun dari sujud sambil mengucap “Allaahu Akbar”.',
      'Duduk iftirasy: duduk di atas telapak kaki kiri, telapak kaki kanan ditegakkan.',
      'Letakkan kedua tangan di atas paha dekat lutut.',
      'Baca doa duduk di antara dua sujud, lalu takbir dan sujud kedua.',
    ],
    notes: [
      'Duduk dengan tenang (tuma’ninah) sebelum sujud kedua.',
      'Jari-jari kaki kanan ditekuk menghadap kiblat.',
      'Setelah sujud kedua, berdiri untuk rakaat berikutnya atau duduk tasyahud.',
    ],
    arabic: 'رَبِّ اغْفِرْ لِيْ وَارْحَمْنِيْ وَاجْبُرْنِيْ وَارْفَعْنِيْ وَارْزُقْنِيْ وَاهْدِنِيْ',
    latin: 'Rabbighfirlii warhamnii wajburnii warfa’nii warzuqnii wahdinii.',
    meaning: 'Ya Tuhanku, ampunilah aku, sayangilah aku, cukupkanlah aku, angkatlah derajatku, berilah aku rezeki, dan berilah aku petunjuk.',
    audioAli: '',
    audioAisyah: '',
  },
  {
    id: 8,
    slug: 'salam',
    title: 'Tasyahud Akhir & Salam',
    shortTitle: 'Salam',
    points: ['Duduk tawarruk', 'Telunjuk kanan terangkat', 'Menoleh ke kanan lalu ke kiri'],
    tip: 'Angkat telunjuk kanan saat tasyahud, lalu menoleh ke kanan dan ke kiri sambil mengucap salam.',
    steps: [
      'Pada rakaat terakhir, duduk tawarruk: kaki kiri dimasukkan ke bawah kaki kanan, pantat menempel lantai.',
      'Baca bacaan tasyahud akhir, lalu sholawat untuk Nabi.',
      'Angkat telunjuk kanan saat mengucap “illallaah”.',
      'Menoleh ke kanan sambil mengucap salam, lalu menoleh ke kiri sambil mengucap salam.',
    ],
    notes: [
      'Pada sholat 3 atau 4 rakaat, setelah rakaat kedua ada tasyahud awal dengan duduk iftirasy.',
      'Salam pertama (ke kanan) termasuk rukun, salam kedua (ke kiri) sunnah.',
      'Setelah salam, sholat selesai. Lanjutkan dengan dzikir dan berdoa.',
    ],
    extra: [
      {
        title: 'Bacaan Tasyahud',
        arabic: 'اَلتَّحِيَّاتُ الْمُبَارَكَاتُ الصَّلَوَاتُ الطَّيِّبَاتُ لِلّٰهِ ۝ اَلسَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللّٰهِ وَبَرَكَاتُهُ ۝ اَلسَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللّٰهِ الصَّالِحِيْنَ ۝ أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُوْلُ اللّٰهِ',
        latin: 'At-tahiyyaatul-mubaarakaatush-shalawaatuth-thayyibaatu lillaah. As-salaamu ’alaika ayyuhan-nabiyyu wa rahmatullaahi wa barakaatuh. As-salaamu ’alainaa wa ’alaa ’ibaadillaahish-shaalihiin. Asyhadu an laa ilaaha illallaah, wa asyhadu anna Muhammadar-rasuulullaah.',
        meaning: 'Segala penghormatan, keberkahan, sholawat, dan kebaikan adalah milik Allah. Semoga keselamatan, rahmat Allah, dan berkah-Nya tercurah kepadamu wahai Nabi. Semoga keselamatan tercurah kepada kami dan hamba-hamba Allah yang saleh. Aku bersaksi tiada Tuhan selain Allah, dan aku bersaksi Muhammad adalah utusan Allah.',
      },
      {
        title: 'Sholawat Ibrahimiyah (tasyahud akhir)',
        arabic: 'اَللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ ۝ كَمَا صَلَّيْتَ عَلَى سَيِّدِنَا إِبْرَاهِيْمَ وَعَلَى آلِ سَيِّدِنَا إِبْرَاهِيْمَ ۝ وَبَارِكْ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ ۝ كَمَا بَارَكْتَ عَلَى سَيِّدِنَا إِبْرَاهِيْمَ وَعَلَى آلِ سَيِّدِنَا إِبْرَاهِيْمَ ۝ فِي الْعَالَمِيْنَ إِنَّكَ حَمِيْدٌ مَجِيْدٌ',
        latin: 'Allaahumma shalli ’alaa sayyidinaa Muhammad, wa ’alaa aali sayyidinaa Muhammad. Kamaa shallaita ’alaa sayyidinaa Ibraahiim, wa ’alaa aali sayyidinaa Ibraahiim. Wa baarik ’alaa sayyidinaa Muhammad, wa ’alaa aali sayyidinaa Muhammad. Kamaa baarakta ’alaa sayyidinaa Ibraahiim, wa ’alaa aali sayyidinaa Ibraahiim. Fil-’aalamiina innaka hamiidum majiid.',
        meaning: 'Ya Allah, limpahkanlah rahmat kepada junjungan kami Nabi Muhammad dan keluarganya, sebagaimana Engkau limpahkan rahmat kepada Nabi Ibrahim dan keluarganya. Limpahkanlah berkah kepada Nabi Muhammad dan keluarganya, sebagaimana Engkau limpahkan berkah kepada Nabi Ibrahim dan keluarganya. Di seluruh alam, sesungguhnya Engkau Maha Terpuji lagi Maha Mulia.',
      },
    ],
    arabic: 'اَلسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللّٰهِ',
    latin: 'Assalaamu ‘alaikum wa rahmatullaah.',
    meaning: 'Semoga keselamatan dan rahmat Allah tercurah untuk kalian.',
    audioAli: '',
    audioAisyah: '',
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

// Soal teks dengan penjelasan ("Tahukah kamu?") yang muncul setelah dijawab benar. Tiap ronde diambil acak.
export type TextQuiz = { question: string; options: string[]; answer: number; explain: string };

export const PINTAR_SHOLAT: TextQuiz[] = [
  { question: 'Ada berapa sholat wajib dalam sehari semalam?', options: ['3 waktu', '4 waktu', '5 waktu', '6 waktu'], answer: 2, explain: 'Sholat wajib ada 5 waktu: Subuh, Dzuhur, Ashar, Maghrib, dan Isya.' },
  { question: 'Sholat Subuh terdiri dari berapa rakaat?', options: ['2 rakaat', '3 rakaat', '4 rakaat', '1 rakaat'], answer: 0, explain: 'Subuh adalah sholat wajib yang paling sedikit rakaatnya, yaitu 2 rakaat.' },
  { question: 'Sholat Maghrib terdiri dari berapa rakaat?', options: ['2 rakaat', '3 rakaat', '4 rakaat', '5 rakaat'], answer: 1, explain: 'Maghrib 3 rakaat. Tasyahud awal di rakaat ke-2, tasyahud akhir di rakaat ke-3.' },
  { question: 'Sholat Dzuhur terdiri dari berapa rakaat?', options: ['2 rakaat', '3 rakaat', '4 rakaat', '6 rakaat'], answer: 2, explain: 'Dzuhur, Ashar, dan Isya masing-masing 4 rakaat.' },
  { question: 'Berapa jumlah rakaat semua sholat wajib dalam sehari semalam?', options: ['12 rakaat', '15 rakaat', '17 rakaat', '20 rakaat'], answer: 2, explain: 'Subuh 2 + Dzuhur 4 + Ashar 4 + Maghrib 3 + Isya 4 = 17 rakaat.' },
  { question: 'Sholat Subuh dikerjakan pada waktu...', options: ['Fajar, sebelum matahari terbit', 'Siang hari', 'Sore hari', 'Saat matahari terbenam'], answer: 0, explain: 'Waktu Subuh mulai terbit fajar sampai sebelum matahari terbit.' },
  { question: 'Sholat Maghrib dikerjakan saat...', options: ['Matahari terbit', 'Matahari terbenam', 'Tengah hari', 'Tengah malam'], answer: 1, explain: 'Waktu Maghrib dimulai ketika matahari terbenam.' },
  { question: 'Sebelum sholat, kita bersuci dengan cara...', options: ['Berwudhu', 'Makan', 'Tidur', 'Berlari'], answer: 0, explain: 'Wudhu membersihkan diri dari hadas kecil, sehingga kita boleh sholat.' },
  { question: 'Arah yang kita hadapi saat sholat disebut...', options: ['Mimbar', 'Kiblat', 'Sajadah', 'Menara'], answer: 1, explain: 'Kiblat adalah arah Ka’bah di kota Makkah. Semua umat Islam sholat menghadap ke sana.' },
  { question: 'Gerakan yang membuka sholat adalah...', options: ['Salam', 'Sujud', 'Takbiratul Ihram', 'Rukuk'], answer: 2, explain: 'Sholat dimulai dengan Takbiratul Ihram, yaitu mengucap “Allahu Akbar” sambil mengangkat tangan.' },
  { question: 'Sholat ditutup dengan...', options: ['Takbir', 'Salam', 'Rukuk', 'Berdiri'], answer: 1, explain: 'Sholat diakhiri salam sambil menoleh ke kanan lalu ke kiri.' },
  { question: 'Surah yang wajib dibaca di setiap rakaat adalah...', options: ['Al-Ikhlas', 'An-Nas', 'Al-Fatihah', 'Al-Falaq'], answer: 2, explain: 'Al-Fatihah wajib dibaca di setiap rakaat. Tanpa Al-Fatihah, rakaat itu tidak sah.' },
  { question: 'Dalam satu rakaat, sujud dilakukan berapa kali?', options: ['1 kali', '2 kali', '3 kali', '4 kali'], answer: 1, explain: 'Setiap rakaat ada 2 kali sujud, dengan duduk di antara dua sujud di tengahnya.' },
  { question: '“Subhaana rabbiyal a’laa” artinya...', options: ['Maha Suci Tuhanku Yang Maha Tinggi', 'Allah Maha Besar', 'Segala puji bagi Allah', 'Ya Tuhanku, ampunilah aku'], answer: 0, explain: 'Bacaan ini dibaca saat sujud, biasanya 3 kali.' },
  { question: 'Orang yang memimpin sholat berjamaah disebut...', options: ['Makmum', 'Muadzin', 'Imam', 'Khatib'], answer: 2, explain: 'Imam berdiri paling depan. Makmum mengikuti di belakang, muadzin mengumandangkan adzan.' },
  { question: 'Panggilan untuk mengajak sholat disebut...', options: ['Adzan', 'Salam', 'Doa', 'Takbir'], answer: 0, explain: 'Adzan dikumandangkan ketika waktu sholat tiba, tanda kita bersiap sholat.' },
  { question: 'Pakaian untuk sholat harus...', options: ['Baru dan mahal', 'Bersih dan menutup aurat', 'Berwarna merah', 'Basah'], answer: 1, explain: 'Pakaian sholat tidak harus baru, yang penting bersih, suci, dan menutup aurat.' },
  { question: 'Saat sholat, pandangan mata diarahkan ke...', options: ['Langit-langit', 'Teman di samping', 'Tempat sujud', 'Pintu'], answer: 2, explain: 'Melihat tempat sujud membantu kita lebih khusyuk dan tidak mudah melamun.' },
];

export const BENAR_SALAH: TextQuiz[] = [
  { question: 'Sholat Subuh ada 4 rakaat.', options: ['Benar', 'Salah'], answer: 1, explain: 'Salah. Sholat Subuh hanya 2 rakaat.' },
  { question: 'Sebelum sholat, kita berwudhu terlebih dahulu.', options: ['Benar', 'Salah'], answer: 0, explain: 'Benar. Wudhu adalah salah satu syarat sah sholat.' },
  { question: 'Saat sujud, dahi dan hidung menempel di sajadah.', options: ['Benar', 'Salah'], answer: 0, explain: 'Benar. Tujuh anggota sujud: dahi (bersama hidung), dua telapak tangan, dua lutut, dan ujung jari kedua kaki.' },
  { question: 'Saat rukuk, punggung dibuat lurus rata.', options: ['Benar', 'Salah'], answer: 0, explain: 'Benar. Punggung dan kepala lurus rata, kedua tangan memegang lutut.' },
  { question: 'Sholat diakhiri dengan takbir.', options: ['Benar', 'Salah'], answer: 1, explain: 'Salah. Sholat diawali takbir dan diakhiri salam.' },
  { question: 'Al-Fatihah dibaca di setiap rakaat.', options: ['Benar', 'Salah'], answer: 0, explain: 'Benar. Al-Fatihah termasuk rukun sholat di setiap rakaat.' },
  { question: 'Sholat Maghrib ada 3 rakaat.', options: ['Benar', 'Salah'], answer: 0, explain: 'Benar. Maghrib satu-satunya sholat wajib yang 3 rakaat.' },
  { question: 'Saat salam, kita menoleh ke kanan lalu ke kiri.', options: ['Benar', 'Salah'], answer: 0, explain: 'Benar. Salam pertama menoleh ke kanan, salam kedua ke kiri.' },
  { question: 'Boleh tertawa dan bercanda saat sholat.', options: ['Benar', 'Salah'], answer: 1, explain: 'Salah. Sholat harus tenang dan khusyuk. Tertawa bisa membatalkan sholat.' },
  { question: 'Makan dan minum membatalkan sholat.', options: ['Benar', 'Salah'], answer: 0, explain: 'Benar. Makan dan minum dengan sengaja saat sholat membuat sholat batal.' },
  { question: 'Dalam satu rakaat hanya ada satu kali sujud.', options: ['Benar', 'Salah'], answer: 1, explain: 'Salah. Setiap rakaat ada dua kali sujud.' },
  { question: 'Bacaan rukuk adalah “Subhaana rabbiyal ‘azhiim”.', options: ['Benar', 'Salah'], answer: 0, explain: 'Benar. Artinya: Maha Suci Tuhanku Yang Maha Agung.' },
  { question: 'Sholat Isya dikerjakan pada pagi hari.', options: ['Benar', 'Salah'], answer: 1, explain: 'Salah. Isya dikerjakan malam hari, setelah waktu Maghrib habis.' },
  { question: 'Saat sholat kita menghadap kiblat.', options: ['Benar', 'Salah'], answer: 0, explain: 'Benar. Kiblat adalah arah Ka’bah di Makkah.' },
  { question: 'Sholat Ashar ada 4 rakaat.', options: ['Benar', 'Salah'], answer: 0, explain: 'Benar. Ashar dikerjakan sore hari sebanyak 4 rakaat.' },
  { question: 'Takbiratul Ihram dilakukan di akhir sholat.', options: ['Benar', 'Salah'], answer: 1, explain: 'Salah. Takbiratul Ihram adalah gerakan pembuka sholat.' },
  { question: 'Saat i’tidal kita membaca “Sami’allaahu liman hamidah”.', options: ['Benar', 'Salah'], answer: 0, explain: 'Benar. Dibaca saat bangkit dari rukuk, lalu “Rabbanaa wa lakal-hamdu”.' },
  { question: 'Jumlah rakaat sholat wajib sehari semalam adalah 17.', options: ['Benar', 'Salah'], answer: 0, explain: 'Benar. 2 + 4 + 4 + 3 + 4 = 17 rakaat.' },
  { question: 'Orang yang memimpin sholat berjamaah disebut makmum.', options: ['Benar', 'Salah'], answer: 1, explain: 'Salah. Pemimpinnya disebut imam, yang mengikuti disebut makmum.' },
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
