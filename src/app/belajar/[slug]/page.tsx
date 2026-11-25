import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import LearnView from '@/components/LearnView';
import { MATERIALS } from '@/data/sholatData';

export const generateStaticParams = () => MATERIALS.map((m) => ({ slug: m.slug }));

async function Content({ params }: Pick<PageProps<'/belajar/[slug]'>, 'params'>) {
  const { slug } = await params;
  if (!MATERIALS.some((m) => m.slug === slug)) notFound();
  return <LearnView slug={slug} />;
}

export default function Page(props: PageProps<'/belajar/[slug]'>) {
  return (
    <Suspense fallback={null}>
      <Content params={props.params} />
    </Suspense>
  );
}
