import { Suspense } from 'react';
import WudhuLearn from '@/components/WudhuLearn';

async function Content({ searchParams }: PageProps<'/belajar/wudhu'>) {
  const { ke, langkah } = await searchParams;
  return <WudhuLearn ke={typeof ke === 'string' ? ke : undefined} start={Number(langkah) - 1 || 0} />;
}

export default function Page(props: PageProps<'/belajar/wudhu'>) {
  return (
    <Suspense fallback={null}>
      <Content {...props} />
    </Suspense>
  );
}
