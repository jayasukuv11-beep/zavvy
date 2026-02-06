
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; // Need to create Table component
import { Download, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';

// Simplified internal table since we don't have full shadcn table yet
function SimpleTable({ data }: { data: any[] }) {
    if (!data?.length) return <p className="text-center text-slate-500 py-8">No entries yet.</p>;

    return (
        <div className="overflow-x-auto border rounded-lg bg-white shadow-sm">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                    <tr>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Tier</th>
                        <th className="px-4 py-3">Early Bird</th>
                        <th className="px-4 py-3">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {data.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-medium text-slate-900">{row.email}</td>
                            <td className="px-4 py-3">
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${row.tier_interest === 'pro'
                                        ? 'bg-rose-100 text-rose-700'
                                        : 'bg-teal-100 text-teal-700'
                                    }`}>
                                    {row.tier_interest.toUpperCase()}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                {row.is_early_bird ? '✅' : '-'}
                            </td>
                            <td className="px-4 py-3 text-slate-500">
                                {new Date(row.created_at).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        // Simple client-side check for demo purposes
        // IN PRODUCTION: Use NextAuth or real server-side auth
        if (password === 'zavvy-admin-2026') {
            setIsAuthenticated(true);
            fetchData();
        } else {
            toast.error('Invalid password');
        }
    }

    async function fetchData() {
        setLoading(true);
        const { data: result, error } = await supabase
            .from('waitlist')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            toast.error('Failed to fetch data');
            console.error(error);
        } else {
            setData(result || []);
        }
        setLoading(false);
    }

    function downloadCSV() {
        const headers = ['ID,Email,Tier,Early Bird,Created At'];
        const rows = data.map(row =>
            `${row.id},${row.email},${row.tier_interest},${row.is_early_bird},${row.created_at}`
        );
        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zavvy-waitlist-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
                <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full space-y-4">
                    <div className="flex justify-center mb-4 text-slate-800">
                        <Lock className="w-12 h-12" />
                    </div>
                    <h2 className="text-xl font-bold text-center text-slate-900">Admin Access</h2>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border p-2 rounded"
                        placeholder="Enter password..."
                    />
                    <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800">
                        Unlock
                    </Button>
                </form>
            </div>
        );
    }

    const proCount = data.filter(r => r.tier_interest === 'pro').length;

    return (
        <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Waitlist Dashboard</h1>
                        <p className="text-slate-500">Manage your early adopters</p>
                    </div>
                    <Button onClick={downloadCSV} variant="outline" className="border-slate-300">
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-medium text-slate-500 uppercase">Total Signups</h3>
                        <p className="text-3xl font-bold text-slate-900">{data.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-teal-100 bg-teal-50/50 shadow-sm">
                        <h3 className="text-sm font-medium text-teal-600 uppercase">Free Tier</h3>
                        <p className="text-3xl font-bold text-teal-900">{data.length - proCount}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-rose-100 bg-rose-50/50 shadow-sm">
                        <h3 className="text-sm font-medium text-rose-600 uppercase">Pro Founders</h3>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-rose-900">{proCount}</p>
                            <span className="text-sm text-rose-500">/ 50 limit</span>
                        </div>
                        <div className="w-full bg-rose-200 h-2 mt-2 rounded-full overflow-hidden">
                            <div
                                className="bg-rose-500 h-full transition-all duration-500"
                                style={{ width: `${Math.min(100, (proCount / 50) * 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" />
                        <p className="mt-2 text-slate-500">Loading data...</p>
                    </div>
                ) : (
                    <SimpleTable data={data} />
                )}
            </div>
        </div>
    );
}
