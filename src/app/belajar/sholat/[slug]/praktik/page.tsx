import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import SholatLearn from '@/components/SholatLearn';
import { namaDariNiat, SHOLAT_LAIN, urutanOf } from '@/data/sunnahData';

export const generateStaticParams = () => SHOLAT_LAIN.map((s) => ({ slug: s.slug }));

// Belajar sholat sunnah/lainnya langkah demi langkah. ?niat=i memilih niat (mis. qabliyah/ba'diyah, qadha Subuh/Dzuhur).
async function Content({ params, searchParams }: PageProps<'/belajar/sholat/[slug]/praktik'>) {
  const { slug } = await params;
  const { niat, langkah } = await searchParams;
  const s = SHOLAT_LAIN.find((x) => x.slug === slug);
  if (!s) notFound();
  const i = Math.min(Math.max(0, Number(niat) || 0), s.niat.length - 1);
  const urutan = urutanOf(s, i);
  return (
    <SholatLearn key={`${slug}-${i}`} w={{ name: namaDariNiat(s.niat[i]), rakaat: s.tanpaRakaat ? 0 : urutan.length, jahr: 0 }}
      niat={s.niat[i]} urutan={urutan} query={`niat=${i}&`} back={`/belajar/sholat/${slug}`} start={Number(langkah) - 1 || 0} />
  );
}

export default function Page(props: PageProps<'/belajar/sholat/[slug]/praktik'>) {
  return (
    <Suspense fallback={null}>
      <Content {...props} />
    </Suspense>
  );
}
