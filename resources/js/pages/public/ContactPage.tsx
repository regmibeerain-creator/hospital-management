import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import cmsApi from '../../lib/cms-api';

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await cmsApi.public.submitInquiry(form);
            setSubmitted(true);
            setForm({ name: '', email: '', phone: '', subject: '', message: '' });
        } catch {
            setError('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link to="/website" className="font-semibold text-gray-900">← Back to Home</Link>
                    <span className="font-semibold text-gray-900">Contact</span>
                    <Link to="/login" className="text-sm text-indigo-600">Login</Link>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Get in Touch</h1>
                        <p className="mt-2 text-gray-500">
                            Have questions or need assistance? We're here to help. Send us a message and we'll respond promptly.
                        </p>

                        <div className="mt-8 space-y-6">
                            {[
                                { icon: '📍', label: 'Address', value: 'Kathmandu, Nepal' },
                                { icon: '📞', label: 'Phone', value: '+977-1-4XXXXXX' },
                                { icon: '✉️', label: 'Email', value: 'info@hospital.com' },
                                { icon: '🕐', label: 'Hours', value: '24/7 Emergency Service' },
                            ].map((item) => (
                                <div key={item.label} className="flex items-start gap-3">
                                    <span className="text-xl">{item.icon}</span>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{item.label}</p>
                                        <p className="text-sm text-gray-500">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        {submitted ? (
                            <div className="text-center py-8">
                                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900">Message Sent!</h3>
                                <p className="mt-2 text-sm text-gray-500">Thank you for reaching out. We'll get back to you soon.</p>
                                <button onClick={() => setSubmitted(false)} className="mt-4 text-indigo-600 text-sm font-medium hover:text-indigo-700">
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name *</label>
                                    <input
                                        type="text" required value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email *</label>
                                        <input
                                            type="email" required value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                                        <input
                                            type="tel" value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Subject *</label>
                                    <input
                                        type="text" required value={form.subject}
                                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Message *</label>
                                    <textarea
                                        required value={form.message}
                                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                                        rows={4}
                                        className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    />
                                </div>
                                <button
                                    type="submit" disabled={loading}
                                    className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
