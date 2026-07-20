import { Link } from 'react-router-dom';
import { BookOpen, Star, Eye, Heart } from 'lucide-react';
import { useState } from 'react';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const BookCardSkeleton = () => (
  <div className="glass-card overflow-hidden">
    <div className="skeleton h-52 w-full" />
    <div className="p-4 space-y-3">
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-3 w-1/2 rounded" />
      <div className="skeleton h-3 w-1/3 rounded" />
      <div className="skeleton h-9 w-full rounded-lg mt-2" />
    </div>
  </div>
);

export default function BookCard({ book, showFavorite = true }) {
  const { isAuthenticated } = useAuth();
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please sign in to save favorites');
      return;
    }
    setFavLoading(true);
    try {
      const res = await userAPI.toggleFavorite(book._id);
      setIsFav(res.data.isFavorite);
      toast.success(res.data.message);
    } catch {
      toast.error('Failed to update favorites');
    } finally {
      setFavLoading(false);
    }
  };

  const categoryColors = {
    '1st Year': 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
    '2nd Year': 'bg-sky-900/60 text-sky-300 border-sky-700',
    '3rd Year': 'bg-violet-900/60 text-violet-300 border-violet-700',
    '4th Year': 'bg-amber-900/60 text-amber-300 border-amber-700',
    'General Knowledge': 'bg-pink-900/60 text-pink-300 border-pink-700',
    Reference: 'bg-slate-800 text-slate-300 border-slate-600',
  };

  return (
    <Link to={`/books/${book._id}`} className="block">
      <div className="book-card h-full flex flex-col group">
        {/* Cover Image */}
        <div className="relative overflow-hidden">
          {book.coverImageUrl ? (
            <img
              src={book.coverImageUrl}
              alt={book.title}
              className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-52 bg-gradient-to-br from-primary-900 to-violet-900 flex items-center justify-center">
              <BookOpen size={48} className="text-primary-400 opacity-50" />
            </div>
          )}

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className={`badge border text-xs ${categoryColors[book.category] || 'bg-slate-800 text-slate-300 border-slate-600'}`}>
              {book.category}
            </span>
          </div>

          {/* Favorite button */}
          {showFavorite && (
            <button
              onClick={handleFavorite}
              disabled={favLoading}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface/80 backdrop-blur-sm border border-surface-border flex items-center justify-center transition-all hover:scale-110 hover:bg-surface"
              aria-label="Toggle favorite"
            >
              <Heart
                size={14}
                className={isFav ? 'text-red-500 fill-red-500' : 'text-slate-400'}
              />
            </button>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-card/80 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-display font-semibold text-white text-sm leading-tight mb-1 line-clamp-2 group-hover:text-primary-300 transition-colors">
            {book.title}
          </h3>
          <p className="text-slate-400 text-xs mb-3">{book.author}</p>

          {/* Stats */}
          <div className="flex items-center gap-3 mt-auto">
            <div className="flex items-center gap-1 text-amber-400 text-xs">
              <Star size={12} className="fill-amber-400" />
              <span>{book.averageRating?.toFixed(1) || '—'}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500 text-xs">
              <Eye size={12} />
              <span>{book.viewsCount?.toLocaleString() || 0}</span>
            </div>
            {book.subject && (
              <span className="ml-auto text-xs text-slate-500 truncate max-w-[80px]">{book.subject}</span>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-surface-border">
            <span className="text-primary-400 text-xs font-medium group-hover:text-primary-300 transition-colors">
              Read Now →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
