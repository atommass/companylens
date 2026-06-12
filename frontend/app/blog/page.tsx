import Link from 'next/link';
import { Header } from '@/components/header';
import { FooterSection } from '@/components/footer-section';
import { fetchBlogPosts } from '@/lib/content';

export default async function BlogPage() {
  const posts = await fetchBlogPosts();

  return (
    <div className="flex min-h-screen flex-col bg-gray-900 text-gray-100">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.2em] text-gray-400">Blog</p>
          <h1 className="mt-2 text-4xl font-bold text-white">Latest articles</h1>
          <p className="mt-3 max-w-2xl text-gray-300">
            News, analysis, and transparency insights from the CompanyLens team.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-gray-700 bg-gray-800 p-8 text-gray-300">
            No published articles yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((post) => (
              <article key={post.id} className="rounded-2xl border border-gray-700 bg-gray-800 p-6 transition hover:border-[#533483]">
                <p className="text-xs uppercase tracking-[0.15em] text-gray-400">
                  {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Unscheduled'}
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-white">{post.title}</h2>
                <p className="mt-3 text-gray-300">{post.excerpt ?? 'Read the full article for details.'}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-sm text-gray-400">By {post.author ?? 'CompanyLens Team'}</span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="rounded-lg bg-[#533483] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6b4799]"
                  >
                    Read article
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <FooterSection />
    </div>
  );
}
