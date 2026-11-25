import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import SholatLearn from '@/components/SholatLearn';
import { WAKTU } from '@/data/panduanData';

export const generateStaticParams = () => WAKTU.map((w) => ({ waktu: w.slug }));

async function Content({ params, searchParams }: PageProps<'/belajar/fardhu/[waktu]'>) {
  const { waktu } = await params;
  const { langkah } = await searchParams; // posisi langkah tersimpan di URL agar tidak hilang saat refresh
  const w = WAKTU.find((x) => x.slug === waktu);
  if (!w) notFound();
  return <SholatLearn key={waktu} w={w} start={Number(langkah) - 1 || 0} />;
}

export default function Page(props: PageProps<'/belajar/fardhu/[waktu]'>) {
  return (
    <Suspense fallback={null}>
      <Content {...props} />
    </Suspense>
  );
}
