import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import SholatDetail from '@/components/SholatDetail';
import { SHOLAT_LAIN } from '@/data/sunnahData';

export const generateStaticParams = () => SHOLAT_LAIN.map((s) => ({ slug: s.slug }));

async function Content({ params }: Pick<PageProps<'/belajar/sholat/[slug]'>, 'params'>) {
  const { slug } = await params;
  if (!SHOLAT_LAIN.some((x) => x.slug === slug)) notFound();
  return <SholatDetail slug={slug} />;
}

export default function Page(props: PageProps<'/belajar/sholat/[slug]'>) {
  return (
    <Suspense fallback={null}>
      <Content params={props.params} />
    </Suspense>
  );
}
