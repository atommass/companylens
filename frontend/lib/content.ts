type JsonMap = Record<string, unknown>;

export type CmsSection = {
  id: number;
  type: string;
  title: string | null;
  content: JsonMap | null;
  sort_order: number;
};

export type CmsPage = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  seo_title: string | null;
  seo_description: string | null;
  updated_at: string | null;
  sections: CmsSection[];
};

export type BlogPostSummary = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
  author: string | null;
  categories: Array<{ id: number; name: string; slug: string }>;
};

export type BlogPostDetail = BlogPostSummary & {
  body: string;
  seo_title: string | null;
  seo_description: string | null;
  updated_at: string | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function contentFetch<T>(path: string): Promise<T | null> {
  if (!API_URL) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}${path}`, {
      next: { revalidate: 60 },
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchHomePageContent() {
  const payload = await contentFetch<{ data: CmsPage }>('/api/content/pages/home');
  return payload?.data ?? null;
}

export async function fetchBlogPosts() {
  const payload = await contentFetch<{ data: BlogPostSummary[] }>('/api/content/posts');
  return payload?.data ?? [];
}

export async function fetchBlogPostBySlug(slug: string) {
  const payload = await contentFetch<{ data: BlogPostDetail }>(`/api/content/posts/${encodeURIComponent(slug)}`);
  return payload?.data ?? null;
}
