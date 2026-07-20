import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BookOpen, Star, Eye, Download, ArrowLeft, User, Calendar, FileText, Bookmark, Heart, MessageSquare } from 'lucide-react';
import { booksAPI, reviewsAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const StarRating = ({ value, onChange, readOnly = false }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => !readOnly && onChange?.(star)}
        className={`star text-2xl ${readOnly ? 'cursor-default' : 'cursor-pointer'} ${
          star <= value ? 'text-amber-400' : 'text-slate-600'
        }`}
        disabled={readOnly}
      >
        ★
      </button>
    ))}
  </div>
);

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [bookRes, reviewRes] = await Promise.all([
          booksAPI.getOne(id),
          reviewsAPI.getForBook(id),
        ]);
        setBook(bookRes.data.data);
        setReviews(reviewRes.data.data);
        document.title = `${bookRes.data.data.title} — Digital Library`;
      } catch {
        toast.error('Book not found');
        navigate('/books');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleReadNow = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to read books');
      navigate('/login');
      return;
    }
    navigate(`/read/${id}`);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please sign in to review'); return; }
    if (reviewForm.rating === 0) { toast.error('Please select a rating'); return; }

    setSubmitting(true);
    try {
      const res = await reviewsAPI.submit(id, reviewForm);
      setReviews((prev) => {
        const exists = prev.find((r) => r._id === res.data.data._id);
        return exists ? prev.map((r) => r._id === res.data.data._id ? res.data.data : r) : [res.data.data, ...prev];
      });
      toast.success(res.data.message);
      setReviewForm({ rating: 0, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="skeleton h-80 rounded-xl" />
          <div className="md:col-span-2 space-y-4">
            <div className="skeleton h-8 w-3/4 rounded" />
            <div className="skeleton h-4 w-1/3 rounded" />
            <div className="skeleton h-24 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Back */}
      <Link to="/books" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Books
      </Link>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Cover */}
        <div className="md:col-span-1">
          <div className="sticky top-24">
            <div className="relative rounded-xl overflow-hidden shadow-card aspect-[3/4]">
              {book.coverImageUrl ? (
                <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-900 to-violet-900 flex items-center justify-center">
                  <BookOpen size={64} className="text-primary-400 opacity-40" />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 space-y-3">
              <button onClick={handleReadNow} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                <BookOpen size={18} /> Read Now
              </button>
              {book.totalPages && (
                <p className="text-center text-xs text-slate-500">{book.totalPages} pages · {book.fileSize}</p>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="md:col-span-2">
          <div className="flex flex-wrap items-start gap-2 mb-3">
            <span className="badge-primary">{book.category}</span>
            <span className="badge bg-slate-800 text-slate-300 border border-slate-600">{book.resourceType}</span>
          </div>

          <h1 className="text-3xl font-display font-bold text-white mb-2">{book.title}</h1>
          <p className="text-slate-400 text-lg mb-4">by {book.author}</p>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-6">
            <StarRating value={Math.round(book.averageRating || 0)} readOnly />
            <span className="text-amber-400 font-semibold">{book.averageRating?.toFixed(1) || '0'}</span>
            <span className="text-slate-500 text-sm">({book.reviewsCount} reviews)</span>
            <span className="text-slate-600">·</span>
            <div className="flex items-center gap-1 text-slate-400 text-sm">
              <Eye size={14} /> {book.viewsCount?.toLocaleString()} views
            </div>
          </div>

          <p className="text-slate-300 leading-relaxed mb-8">{book.description}</p>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <User size={14} />, label: 'Author', value: book.author },
              { icon: <FileText size={14} />, label: 'Subject', value: book.subject },
              { icon: <Bookmark size={14} />, label: 'Branch', value: book.branch },
              { icon: <Calendar size={14} />, label: 'Published', value: book.publishedYear || '—' },
            ].map(({ icon, label, value }) => (
              <div key={label} className="glass-card p-3 flex items-center gap-3">
                <div className="text-primary-400">{icon}</div>
                <div>
                  <div className="text-xs text-slate-500">{label}</div>
                  <div className="text-sm text-white font-medium">{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tags */}
          {book.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {book.tags.map((tag) => (
                <span key={tag} className="px-2.5 py-1 rounded-full text-xs bg-surface-card border border-surface-border text-slate-400">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Reviews ─────────────────────────────────────────────── */}
      <section className="border-t border-surface-border pt-10">
        <h2 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
          <MessageSquare size={20} className="text-primary-400" />
          Reviews ({reviews.length})
        </h2>

        {/* Review Form */}
        {isAuthenticated && (
          <form onSubmit={handleSubmitReview} className="glass-card p-6 mb-8">
            <h3 className="font-semibold text-white mb-4">Write a Review</h3>
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Your Rating</label>
              <StarRating value={reviewForm.rating} onChange={(r) => setReviewForm((p) => ({ ...p, rating: r }))} />
            </div>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))}
              placeholder="Share your thoughts on this book..."
              rows={3}
              className="input-field resize-none mb-4"
              maxLength={1000}
            />
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {/* Review List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No reviews yet. Be the first!</p>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {review.user?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{review.user?.name}</p>
                      <p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <StarRating value={review.rating} readOnly />
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{review.comment}</p>
                {review.isEdited && <p className="text-xs text-slate-600 mt-2">(edited)</p>}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
