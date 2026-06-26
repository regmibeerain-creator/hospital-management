import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import cmsApi from '../../lib/cms-api';

interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featured_image: string | null;
    published_at: string;
    category: { id: number; name: string; slug: string } | null;
    author: { id: number; name: string } | null;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    posts_count: number;
}

export default function BlogList() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            cmsApi.public.getPosts({ category: activeCategory || undefined }),
            cmsApi.public.getCategories(),
        ])
            .then(([postsRes, catRes]) => {
                setPosts(postsRes.data.data || []);
                setCategories(catRes.data.data || []);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [activeCategory]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Nav */}
            <nav className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/website" className="font-semibold text-gray-900">← Back to Home</Link>
                    <span className="font-semibold text-gray-900">Blog</span>
                    <Link to="/login" className="text-sm text-indigo-600">Login</Link>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-gray-900">Latest News & Articles</h1>
                <p className="mt-2 text-gray-500">Stay updated with health tips, news, and announcements</p>

                {/* Categories */}
                {categories.length > 0 && (
                    <div className="mt-8 flex flex-wrap gap-2">
                        <button
                            onClick={() => setActiveCategory('')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                !activeCategory ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.slug)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    activeCategory === cat.slug ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                {cat.name} ({cat.posts_count})
                            </button>
                        ))}
                    </div>
                )}

                {/* Posts */}
                {loading ? (
                    <div className="mt-12 flex justify-center">
                        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="mt-12 text-center py-12 bg-white rounded-xl border border-gray-200">
                        <p className="text-gray-500">No articles found.</p>
                    </div>
                ) : (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <Link
                                key={post.id}
                                to={`/blog/${post.slug}`}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group"
                            >
                                <div className="h-48 bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center">
                                    {post.featured_image ? (
                                        <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl text-indigo-300">📄</span>
                                    )}
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center gap-2">
                                        {post.category && (
                                            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                                                {post.category.name}
                                            </span>
                                        )}
                                        {post.published_at && (
                                            <span className="text-xs text-gray-400">
                                                {new Date(post.published_at).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="mt-2 font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                        {post.title}
                                    </h2>
                                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                                    {post.author && (
                                        <p className="mt-3 text-xs text-gray-400">By {post.author.name}</p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
