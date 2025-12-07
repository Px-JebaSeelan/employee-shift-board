import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { shiftsAPI, authAPI } from '../api';

export default function Dashboard() {
    const { user, isAdmin, logout } = useAuth();
    const [shifts, setShifts] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ employee: '', date: '', start: '', end: '' });

    const fetchShifts = useCallback(async () => {
        try {
            setLoading(true);
            const res = await shiftsAPI.getAll(dateFilter || undefined);
            setShifts(res.data.shifts || []);
        } catch (e) {
            setError(e.displayMessage || 'Could not load shifts');
        } finally {
            setLoading(false);
        }
    }, [dateFilter]);

    const fetchEmployees = useCallback(async () => {
        if (!isAdmin) return;
        try {
            const res = await authAPI.getEmployees();
            setEmployees(res.data.employees || []);
        } catch (e) { console.error('Failed to load employees'); }
    }, [isAdmin]);

    useEffect(() => { fetchShifts(); fetchEmployees(); }, [fetchShifts, fetchEmployees]);

    const updateForm = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); setSuccess(''); };

    const createShift = async (e) => {
        e.preventDefault();
        if (!form.employee || !form.date || !form.start || !form.end) return setError('All fields required');
        setSubmitting(true);
        try {
            await shiftsAPI.create({ userId: form.employee, date: form.date, startTime: `${form.date}T${form.start}:00`, endTime: `${form.date}T${form.end}:00` });
            setSuccess('Shift created');
            setForm({ employee: '', date: '', start: '', end: '' });
            fetchShifts();
            setTimeout(() => setSuccess(''), 4000);
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to create');
        } finally { setSubmitting(false); }
    };

    const deleteShift = async (id) => {
        if (!window.confirm('Delete this shift?')) return;
        try { await shiftsAPI.delete(id); setSuccess('Deleted'); fetchShifts(); setTimeout(() => setSuccess(''), 4000); }
        catch (e) { setError(e.displayMessage || 'Delete failed'); }
    };

    const fmtTime = d => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const fmtDate = d => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const initials = n => n?.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase() || '?';

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navbar */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto h-16 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="font-semibold text-lg text-slate-800">ShiftBoard</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
                            <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">{initials(user?.name)}</div>
                            <div className="text-sm"><div className="font-medium">{user?.name}</div><div className="text-xs text-slate-500 capitalize">{user?.role}</div></div>
                        </div>
                        <button onClick={logout} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Hey, {user?.name?.split(' ')[0]} 👋</h1>
                    <p className="text-slate-500">{isAdmin ? 'Manage schedules and create shifts' : 'View your upcoming shifts'}</p>
                </div>

                {error && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 text-red-600 rounded-xl mb-6 text-sm">
                        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{error}</span>
                        <button onClick={() => setError('')} className="ml-auto opacity-60 hover:opacity-100">×</button>
                    </div>
                )}

                {success && (
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-600 rounded-xl mb-6 text-sm">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{success}</span>
                    </div>
                )}

                <div className={`grid gap-6 ${isAdmin ? 'lg:grid-cols-[340px_1fr]' : ''}`}>
                    {isAdmin && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 4v16m8-8H4" /></svg>
                                <h3 className="font-semibold text-slate-800">New Shift</h3>
                            </div>
                            <form onSubmit={createShift} className="p-5 space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Employee</label>
                                    <select value={form.employee} onChange={e => updateForm('employee', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option value="">Select...</option>
                                        {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                                    <input type="date" value={form.date} onChange={e => updateForm('date', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Start</label>
                                        <input type="time" value={form.start} onChange={e => updateForm('start', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">End</label>
                                        <input type="time" value={form.end} onChange={e => updateForm('end', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                </div>
                                <div className="text-xs text-indigo-600 bg-indigo-50 p-3 rounded-lg">Shifts must be 4-12 hours. Overlaps are blocked.</div>
                                <button type="submit" disabled={submitting} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition disabled:opacity-60 flex items-center justify-center gap-2">
                                    {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 4v16m8-8H4" /></svg>Create</>}
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h3 className="font-semibold text-slate-800">{isAdmin ? 'All Shifts' : 'My Schedule'}</h3>
                                <p className="text-xs text-slate-500">{shifts.length} shift{shifts.length !== 1 && 's'}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-slate-500">Filter:</span>
                                <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none" />
                                {dateFilter && <button onClick={() => setDateFilter('')} className="text-indigo-600 hover:underline text-xs">Clear</button>}
                            </div>
                        </div>

                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="w-8 h-8 border-3 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
                                <p className="text-slate-500 text-sm">Loading...</p>
                            </div>
                        ) : shifts.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                                <p className="font-medium text-slate-700">No shifts found</p>
                                <p className="text-sm text-slate-500">{dateFilter ? 'Try another date' : 'Nothing scheduled'}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                                            {isAdmin && <th className="px-5 py-3">Employee</th>}
                                            <th className="px-5 py-3">Date</th>
                                            <th className="px-5 py-3">Time</th>
                                            <th className="px-5 py-3">Duration</th>
                                            <th className="px-5 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {shifts.map(s => {
                                            const hrs = Math.round((new Date(s.endTime) - new Date(s.startTime)) / 36e5 * 10) / 10;
                                            return (
                                                <tr key={s._id} className="hover:bg-slate-50 transition">
                                                    {isAdmin && <td className="px-5 py-3 font-medium text-slate-800">{s.userId?.name || 'Unknown'}</td>}
                                                    <td className="px-5 py-3 text-sm text-slate-600">{fmtDate(s.date)}</td>
                                                    <td className="px-5 py-3 text-sm text-slate-600">{fmtTime(s.startTime)} – {fmtTime(s.endTime)}</td>
                                                    <td className="px-5 py-3"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-full">{hrs}h</span></td>
                                                    <td className="px-5 py-3">
                                                        <button onClick={() => deleteShift(s._id)} className="flex items-center gap-1 text-red-500 hover:text-red-600 text-sm">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
