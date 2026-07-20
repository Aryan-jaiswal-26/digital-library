import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, Users, Star, ArrowRight, Zap, Shield, Clock } from 'lucide-react';
import { useBookStore } from '../store/bookStore';
import BookCard, { BookCardSkeleton } from '../components/BookCard';
import SearchBar from '../components/SearchBar';

const CATEGORIES = [
  { label: '1st Year', emoji: '🌱', desc: 'Math, Physics, Chemistry & more', q: '1st Year' },
  { label: '2nd Year', emoji: '💻', desc: 'DSA, OOP, OS, CN, DBMS', q: '2nd Year' },
  { label: '3rd Year', emoji: '🔬', desc: 'TOC, AI, IoT, Web Tech', q: '3rd Year' },
  { label: '4th Year', emoji: '🚀', desc: 'ML, Blockchain, Cloud', q: '4th Year' },
  { label: 'General', emoji: '📚', desc: 'Self-help, Science & more', q: 'General Knowledge' },
  { label: 'Reference', emoji: '🗂️', desc: 'Manuals, Handbooks, Exam Papers', q: 'Reference' },
];

const FEATURES = [
  { icon: <Zap className="text-yellow-400" size={22} />, title: 'Instant Access', desc: 'Read in-browser — no downloads required' },
  { icon: <Shield className="text-emerald-400" size={22} />, title: 'Secure Reading', desc: 'Signed expiring URLs protect every PDF' },
  { icon: <Clock className="text-blue-400" size={22} />, title: 'Progress Tracking', desc: 'Pick up exactly where you left off' },
  { icon: <Star className="text-amber-400" size={22} />, title: 'Community Reviews', desc: 'Ratings and reviews from fellow students' },
];

export default function Home() {
  const { featuredBooks, featuredLoading, fetchFeatured } = useBookStore();

  useEffect(() => {
    fetchFeatured();
    document.title = 'Digital Library — Knowledge at Your Fingertips';
  }, []);

  return (
    <div className="min-h-screen">
      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-16 pb-24 px-4">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-900/60 border border-primary-700 text-primary-300 text-sm font-medium mb-8 animate-fade-in">
            <BookOpen size={14} />
            Free for all Computer Engineering Students
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white mb-6 leading-tight animate-slide-up">
            Your Digital
            <br />
            <span className="gradient-text">Library</span>
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up">
            Explore, read, and download thousands of engineering books, lecture notes,
            and reference materials — all in one place.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8 animate-slide-up">
            <SearchBar showFilters={false} onSearch={() => window.location.href = '/books'} />
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 flex-wrap animate-fade-in">
            <Link to="/books" className="btn-primary flex items-center gap-2 text-base px-8 py-3">
              <BookOpen size={18} /> Browse Library
            </Link>
            <Link to="/register" className="btn-secondary flex items-center gap-2 text-base px-8 py-3">
              Get Started Free <ArrowRight size={16} />
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-12 flex-wrap">
            {[['1000+', 'Books'], ['500+', 'Students'], ['4.8★', 'Rating']].map(([num, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-display font-bold gradient-text">{num}</div>
                <div className="text-slate-500 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} className="glass-card p-5 flex items-start gap-4 hover:border-primary-700 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center shrink-0 border border-surface-border">
                {icon}
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Categories ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="section-title">Browse Categories</h2>
            <p className="section-subtitle">Find books by year or topic</p>
          </div>
          <Link to="/books" className="text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1">
            All Books <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map(({ label, emoji, desc, q }) => (
            <Link
              key={label}
              to={`/books?category=${encodeURIComponent(q)}`}
              className="glass-card p-4 text-center hover:border-primary-700 hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="text-3xl mb-2">{emoji}</div>
              <div className="text-sm font-semibold text-white group-hover:text-primary-300 transition-colors">{label}</div>
              <div className="text-xs text-slate-500 mt-1 leading-tight hidden sm:block">{desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Featured Books ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="section-title">Featured Books</h2>
            <p className="section-subtitle">Top rated picks this week</p>
          </div>
          <Link to="/books?sort=rating" className="text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1">
            See all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {featuredLoading
            ? Array.from({ length: 6 }).map((_, i) => <BookCardSkeleton key={i} />)
            : featuredBooks.length > 0
            ? featuredBooks.map((book) => <BookCard key={book._id} book={book} />)
            : (
              <div className="col-span-6 text-center py-16 text-slate-500">
                <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                <p>No featured books yet. Check back soon!</p>
              </div>
            )
          }
        </div>
      </section>

      {/* ─── CTA Banner ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-900 to-violet-900 border border-primary-700 p-10 text-center">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
          <div className="relative">
            <h2 className="text-3xl font-display font-bold text-white mb-3">
              Start Reading Today
            </h2>
            <p className="text-primary-200 mb-7 max-w-md mx-auto">
              Join hundreds of students. Free access to all books, progress tracking, and bookmarks.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/register" className="bg-white text-primary-800 hover:bg-primary-50 font-semibold px-8 py-3 rounded-lg transition-all active:scale-95">
                Create Free Account
              </Link>
              <Link to="/books" className="text-primary-200 hover:text-white font-medium flex items-center gap-1 transition-colors">
                Explore first <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
