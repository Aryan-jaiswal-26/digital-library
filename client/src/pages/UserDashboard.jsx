import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Heart, TrendingUp, Award, BookMarked, Loader2 } from 'lucide-react';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';

const StatCard = ({ icon, value, label, color }) => (
  <div className="glass-card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <div className="text-2xl font-display font-bold text-white">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  </div>
);

const ProgressBar = ({ value, max }) => {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
  return (
    <div className="w-full bg-surface-border rounded-full h-1.5 mt-2">
      <div
        className="bg-gradient-to-r from-primary-600 to-violet-600 h-1.5 rounded-full transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

export default function UserDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'My Dashboard — Digital Library';
    userAPI.getDashboard()
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-primary-500" />
      </div>
    );
  }

  const { stats = {}, inProgress = [], favorites = [] } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-violet-600 rounded-2xl flex items-center justify-center text-white text-2xl font-display font-bold shadow-glow">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">{user?.role} · {user?.email}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon={<BookOpen size={22} className="text-blue-400" />} value={stats.totalBooksStarted || 0}
          label="Books Started" color="bg-blue-900/40" />
        <StatCard icon={<Award size={22} className="text-emerald-400" />} value={stats.totalBooksCompleted || 0}
          label="Completed" color="bg-emerald-900/40" />
        <StatCard icon={<TrendingUp size={22} className="text-amber-400" />} value={stats.totalPagesRead?.toLocaleString() || 0}
          label="Pages Read" color="bg-amber-900/40" />
        <StatCard icon={<Clock size={22} className="text-violet-400" />}
          value={`${Math.round((stats.totalTimeMinutes || 0) / 60)}h`}
          label="Reading Time" color="bg-violet-900/40" />
      </div>

      {/* Continue Reading */}
      {inProgress.length > 0 && (
        <section className="mb-10">
          <h2 className="section-title flex items-center gap-2">
            <Clock size={20} className="text-primary-400" />
            Continue Reading
          </h2>
          <p className="section-subtitle">Pick up where you left off</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgress.map((progress) => progress.book && (
              <Link key={progress._id} to={`/read/${progress.book._id}`} className="glass-card p-4 flex gap-4 hover:border-primary-700 transition-all hover:-translate-y-0.5 group">
                <div className="w-14 h-20 rounded-lg overflow-hidden shrink-0">
                  {progress.book.coverImageUrl ? (
                    <img src={progress.book.coverImageUrl} alt={progress.book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-900 to-violet-900 flex items-center justify-center">
                      <BookOpen size={20} className="text-primary-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate group-hover:text-primary-300 transition-colors">
                    {progress.book.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Page {progress.lastPageRead}</p>
                  <ProgressBar value={progress.lastPageRead} max={progress.totalPages} />
                  <p className="text-xs text-primary-400 mt-1.5">{progress.completionPercentage}% complete</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Favorites */}
      <section>
        <h2 className="section-title flex items-center gap-2">
          <Heart size={20} className="text-red-400 fill-red-400" />
          My Favorites
        </h2>
        <p className="section-subtitle">Books you've saved</p>
        {favorites.length === 0 ? (
          <div className="glass-card text-center py-16">
            <BookMarked size={40} className="mx-auto mb-3 text-slate-600" />
            <p className="text-slate-400 mb-4">No favorites yet</p>
            <Link to="/books" className="btn-primary">Browse Books</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {favorites.map((book) => <BookCard key={book._id} book={book} showFavorite={false} />)}
          </div>
        )}
      </section>
    </div>
  );
}
