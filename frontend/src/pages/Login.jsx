import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const { login, loading, error, clearError } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localErr, setLocalErr] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        setLocalErr('');
        if (!email.trim()) return setLocalErr('Enter your email');
        if (!password) return setLocalErr('Enter your password');

        const res = await login(email, password);
        if (!res.success) setLocalErr(res.error);
    };

    const err = localErr || error;

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[35%_65%] bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100">
            {/* Sidebar */}
            <aside className="hidden lg:flex flex-col justify-center p-12 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 max-w-md">
                    <h1 className="text-4xl font-bold mb-4">Shift Management Made Simple</h1>
                    <p className="text-lg text-indigo-100 leading-relaxed">
                        Organize your team schedules, prevent conflicts, and keep everyone in sync.
                    </p>
                    <div className="mt-8 space-y-4">
                        {[
                            { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', text: 'Prevent overlapping shifts' },
                            { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', text: '4-hour minimum enforcement' },
                            { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', text: 'Role-based access control' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-indigo-100">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path d={item.icon} />
                                </svg>
                                <span>{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Form */}
            <main className="flex items-center justify-center p-6">
                <div className="w-[65%] min-w-[320px]">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-slate-800">ShiftBoard</span>
                        </div>

                        <h2 className="text-2xl font-semibold text-slate-800 mb-1">Welcome back</h2>
                        <p className="text-slate-500 mb-6">Sign in to continue</p>

                        {err && (
                            <div className="flex items-start gap-3 p-3 bg-red-50 text-red-600 rounded-lg mb-5 text-sm">
                                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{err}</span>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => { setEmail(e.target.value); if (error) clearError(); }}
                                        placeholder="name@company.com"
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={e => { setPassword(e.target.value); if (error) clearError(); }}
                                        placeholder="Your password"
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : 'Sign in'}
                            </button>
                        </form>

                        <p className="text-center text-sm text-slate-500 mt-6">
                            New here? <Link to="/signup" className="text-indigo-600 font-medium hover:underline">Create an account</Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
