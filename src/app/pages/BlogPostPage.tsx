import { Link, Navigate, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useAppData } from '../context/AppDataContext';

export function BlogPostPage() {
  const { id } = useParams();
  const { blogPosts } = useAppData();

  const post = blogPosts.find((item) => item.id === id && item.status === 'published');

  if (!id) {
    return <Navigate to="/" replace />;
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">Blog</p>
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Post not found</h1>
          <p className="mb-8 text-gray-600">
            This post may be unpublished, deleted, or unavailable in this browser session.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <article className="mx-auto max-w-4xl px-4">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-orange-500 transition hover:text-orange-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to latest updates
        </Link>

        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="aspect-[16/8] overflow-hidden bg-gray-100">
            <ImageWithFallback
              src={post.image}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="p-6 sm:p-10">
            <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-orange-500">
              <span>{post.category}</span>
              <span className="h-1 w-1 rounded-full bg-orange-300" />
              <span>{new Date(post.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span className="h-1 w-1 rounded-full bg-orange-300" />
              <span>{post.author}</span>
            </div>

            <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">{post.title}</h1>
            <p className="mb-8 text-lg leading-8 text-gray-600">{post.excerpt}</p>

            <div className="space-y-5 text-base leading-8 text-gray-700 whitespace-pre-wrap">
              {post.content}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
