import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  Users, BookOpen, MessageSquare, TrendingUp, Clock, CheckCircle,
  XCircle, Loader2, Shield, Star, Eye
} from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const StatCard = ({ icon, value, label, color }) => (
  <div className="glass-card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
    <div>
      <div className="text-2xl font-display font-bold text-white">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  </div>
);

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    document.title = 'Admin Panel — Digital Library';
    const load = async () => {
      try {
        const [analyticsRes, pendingRes, usersRes] = await Promise.all([
          adminAPI.getAnalytics(),
          adminAPI.getPendingBooks(),
          adminAPI.getUsers({ limit: 20 }),
        ]);
        setAnalytics(analyticsRes.data.data);
        setPending(pendingRes.data.data);
        setUsers(usersRes.data.data);
      } catch {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleApprove = async (bookId, approved) => {
    try {
      await adminAPI.approveBook(bookId, approved);
      setPending((prev) => prev.filter((b) => b._id !== bookId));
      toast.success(approved ? 'Book approved!' : 'Book rejected');
    } catch {
      toast.error('Action failed');
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await adminAPI.updateUserRole(userId, role);
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, role } : u));
      toast.success('Role updated');
    } catch {
      toast.error('Failed to update role');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-primary-500" />
      </div>
    );
  }

  const { overview, topBooks = [], categoryDistribution = [], recentUsers = [] } = analytics || {};

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'pending', label: `Pending (${pending.length})` },
    { key: 'users', label: 'Users' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-glow">
          <Shield size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Admin Panel</h1>
          <p className="text-slate-400 text-sm">Manage books, users, and content</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-surface-card border border-surface-border rounded-xl p-1 w-fit">
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {tab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard icon={<Users size={22} className="text-blue-400" />} value={overview?.totalUsers || 0} label="Active Users" color="bg-blue-900/40" />
            <StatCard icon={<BookOpen size={22} className="text-emerald-400" />} value={overview?.totalBooks || 0} label="Published Books" color="bg-emerald-900/40" />
            <StatCard icon={<MessageSquare size={22} className="text-violet-400" />} value={overview?.totalReviews || 0} label="Total Reviews" color="bg-violet-900/40" />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Books */}
            <div className="glass-card p-5">
              <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-primary-400" /> Top Viewed Books
              </h3>
              <div className="space-y-3">
                {topBooks.map((book, i) => (
                  <div key={book._id} className="flex items-center gap-3">
                    <span className="text-slate-500 text-sm w-5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{book.title}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1"><Eye size={10} /> {book.viewsCount}</span>
                        <span className="flex items-center gap-1"><Star size={10} className="text-amber-400" /> {book.averageRating?.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Distribution */}
            <div className="glass-card p-5">
              <h3 className="font-display font-semibold text-white mb-4">Books by Category</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryDistribution}>
                  <XAxis dataKey="_id" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {categoryDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── Pending Books Tab ── */}
      {tab === 'pending' && (
        <div className="space-y-4 animate-fade-in">
          {pending.length === 0 ? (
            <div className="glass-card text-center py-16 text-slate-400">
              <CheckCircle size={40} className="mx-auto mb-3 text-emerald-500" />
              <p>All caught up! No books pending approval.</p>
            </div>
          ) : pending.map((book) => (
            <div key={book._id} className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-14 h-20 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-primary-900 to-violet-900 flex items-center justify-center">
                {book.coverImageUrl ? (
                  <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover" />
                ) : <BookOpen size={20} className="text-primary-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white">{book.title}</h3>
                <p className="text-sm text-slate-400">{book.author} · {book.category}</p>
                <p className="text-xs text-slate-500 mt-1">Uploaded by: {book.uploadedBy?.name || 'Unknown'} ({book.uploadedBy?.email})</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleApprove(book._id, true)} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-all active:scale-95">
                  <CheckCircle size={14} /> Approve
                </button>
                <button onClick={() => handleApprove(book._id, false)} className="flex items-center gap-1.5 px-4 py-2 bg-red-600/30 hover:bg-red-600/50 text-red-300 text-sm font-medium rounded-lg border border-red-700 transition-all active:scale-95">
                  <XCircle size={14} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Users Tab ── */}
      {tab === 'users' && (
        <div className="glass-card overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">User</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Role</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Joined</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-surface-card/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {u.name?.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{u.name}</div>
                          <div className="text-xs text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="bg-surface-card border border-surface-border text-slate-300 text-sm rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        {['student', 'faculty', 'admin'].map((r) => (
                          <option key={r} value={r} className="bg-surface-card">{r}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={async () => {
                          try { await adminAPI.toggleUserStatus(u._id); toast.success('Status toggled'); setUsers((prev) => prev.map((x) => x._id === u._id ? { ...x, isActive: !x.isActive } : x)); }
                          catch { toast.error('Failed'); }
                        }}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-all ${u.isActive ? 'border-red-700 text-red-400 hover:bg-red-900/30' : 'border-emerald-700 text-emerald-400 hover:bg-emerald-900/30'}`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
