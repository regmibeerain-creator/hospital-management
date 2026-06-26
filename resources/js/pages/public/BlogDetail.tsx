import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import cmsApi from '../../lib/cms-api';

interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featured_image: string | null;
    published_at: string;
    category: { id: number; name: string; slug: string } | null;
    author: { id: number; name: string } | null;
}

export default function BlogDetail() {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!slug) return;
        cmsApi.public.getPost(slug)
            .then((res) => setPost(res.data.data))
            .catch(() => setError('Article not found'))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <p className="text-gray-500">{error || 'Article not found'}</p>
                <Link to="/website/blog" className="mt-4 text-indigo-600">← Back to Blog</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-100">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center">
                    <Link to="/website/blog" className="text-sm text-gray-600 hover:text-gray-900">← Back to Blog</Link>
                </div>
            </nav>

            <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
                {post.featured_image && (
                    <img src={post.featured_image} alt={post.title} className="w-full h-64 sm:h-96 object-cover rounded-xl mb-8" />
                )}

                <div className="flex items-center gap-3 text-sm text-gray-500">
                    {post.category && (
                        <span className="text-indigo-600 font-medium bg-indigo-50 px-3 py-1 rounded-full">
                            {post.category.name}
                        </span>
                    )}
                    {post.published_at && (
                        <span>{new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    )}
                </div>

                <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-gray-900">{post.title}</h1>

                {post.author && (
                    <p className="mt-2 text-sm text-gray-500">By {post.author.name}</p>
                )}

                {post.excerpt && (
                    <p className="mt-6 text-lg text-gray-600 leading-relaxed">{post.excerpt}</p>
                )}

                <div className="mt-8 prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
            </article>
        </div>
    );
}
