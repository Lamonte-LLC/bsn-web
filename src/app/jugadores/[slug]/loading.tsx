import PageSkeleton from '@/historia/components/PageSkeleton';

export default function Loading() {
  return <PageSkeleton band="hero" blocks={['tabs', 'table', 'card']} />;
}
