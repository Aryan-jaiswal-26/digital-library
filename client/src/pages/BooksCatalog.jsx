import { useEffect } from 'react';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBookStore } from '../store/bookStore';
import BookCard, { BookCardSkeleton } from '../components/BookCard';
import SearchBar from '../components/SearchBar';
import { useSearchParams } from 'react-router-dom';

export default function BooksCatalog() {
  const { books, pagination, filters, setFilter, fetchBooks, loading, error } = useBookStore();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Read URL query params on mount
    const cat = searchParams.get('category');
    const sort = searchParams.get('sort');
    if (cat) setFilter('category', cat);
    if (sort) setFilter('sort', sort);
    fetchBooks();
    document.title = 'Browse Books — Digital Library';
  }, []);

  const handlePageChange = (newPage) => {
    setFilter('page', newPage);
    fetchBooks();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">Book Catalog</h1>
        <p className="text-slate-400">
          {pagination.total > 0 ? `${pagination.total} books available` : 'Search and explore our collection'}
        </p>
      </div>

      {/* Search + Filters */}
      <div className="mb-8">
        <SearchBar />
      </div>

      {/* Results */}
      {error ? (
        <div className="text-center py-20">
          <p className="text-red-400">{error}</p>
          <button onClick={fetchBooks} className="btn-primary mt-4">Try Again</button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {Array.from({ length: 10 }).map((_, i) => <BookCardSkeleton key={i} />)}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen size={48} className="mx-auto mb-4 text-slate-600" />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">No books found</h3>
          <p className="text-slate-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {books.map((book) => <BookCard key={book._id} book={book} />)}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-12">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="btn-secondary p-2 disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                        page === pagination.page
                          ? 'bg-primary-600 text-white'
                          : 'bg-surface-card text-slate-400 hover:text-white border border-surface-border'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="btn-secondary p-2 disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
