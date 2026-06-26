import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import cmsApi from '../../lib/cms-api';

interface FaqCategory {
    id: number;
    name: string;
    slug: string;
    faqs: { id: number; question: string; answer: string }[];
}

export default function FaqPage() {
    const [categories, setCategories] = useState<FaqCategory[]>([]);
    const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set());
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cmsApi.public.getFaqs()
            .then((res) => {
                const cats = res.data.data || [];
                setCategories(cats);
                if (cats.length > 0) setActiveCategory(cats[0].id);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const toggleFaq = (id: number) => {
        setOpenFaqs((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const activeCategoryData = categories.find((c) => c.id === activeCategory);

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link to="/website" className="font-semibold text-gray-900">← Back to Home</Link>
                    <span className="font-semibold text-gray-900">FAQ</span>
                    <Link to="/login" className="text-sm text-indigo-600">Login</Link>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
                <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
                <p className="mt-2 text-gray-500">Find answers to common questions about our services</p>

                {loading ? (
                    <div className="mt-12 flex justify-center">
                        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : categories.length === 0 ? (
                    <div className="mt-12 text-center py-12 bg-white rounded-xl border border-gray-200">
                        <p className="text-gray-500">No FAQs available yet.</p>
                    </div>
                ) : (
                    <div className="mt-8">
                        {/* Category Tabs */}
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                        activeCategory === cat.id
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        {/* FAQ Accordion */}
                        {activeCategoryData && (
                            <div className="mt-6 space-y-3">
                                {activeCategoryData.faqs.length === 0 ? (
                                    <p className="text-center py-8 text-gray-500">No FAQs in this category.</p>
                                ) : (
                                    activeCategoryData.faqs.map((faq) => (
                                        <div key={faq.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                            <button
                                                onClick={() => toggleFaq(faq.id)}
                                                className="w-full flex items-center justify-between px-6 py-4 text-left"
                                            >
                                                <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                                                <svg
                                                    className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                                                        openFaqs.has(faq.id) ? 'rotate-180' : ''
                                                    }`}
                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            {openFaqs.has(faq.id) && (
                                                <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">
                                                    {faq.answer}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-12 bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <h2 className="text-lg font-semibold text-gray-900">Still have questions?</h2>
                    <p className="mt-1 text-sm text-gray-500">We're here to help you</p>
                    <Link to="/website/contact" className="mt-4 inline-flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        Contact Us
                    </Link>
                </div>
            </div>
        </div>
    );
}
