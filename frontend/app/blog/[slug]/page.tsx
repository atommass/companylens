import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { FooterSection } from '@/components/footer-section';
import { fetchBlogPostBySlug } from '@/lib/content';

type BlogPostDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostDetailPage({ params }: BlogPostDetailPageProps) {
  const { slug } = await params;
  const post = await fetchBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-900 text-gray-100">
      <Header />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <Link href="/blog" className="mb-6 inline-flex text-sm text-gray-400 transition hover:text-white">
          ← Back to articles
        </Link>

        <article className="rounded-2xl border border-gray-700 bg-gray-800 p-8">
          <p className="text-xs uppercase tracking-[0.15em] text-gray-400">
            {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Unscheduled'}
          </p>
          <h1 className="mt-3 text-4xl font-bold text-white">{post.title}</h1>
          <p className="mt-3 text-gray-300">By {post.author ?? 'CompanyLens Team'}</p>

          {post.excerpt ? <p className="mt-6 text-lg text-gray-200">{post.excerpt}</p> : null}

          <div className="mt-8 whitespace-pre-wrap leading-8 text-gray-200">{post.body}</div>
        </article>
      </main>

      <FooterSection />
    </div>
  );
}
