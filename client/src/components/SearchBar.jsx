import { useState, useCallback } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useBookStore } from '../store/bookStore';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'General Knowledge', 'Reference'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'views', label: 'Most Viewed' },
  { value: 'title', label: 'A–Z' },
];

export default function SearchBar({ onSearch, showFilters = true }) {
  const { filters, setFilter, fetchBooks } = useBookStore();
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const navigate = useNavigate();

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      fetchBooks();
      if (onSearch) onSearch();
    },
    [fetchBooks, onSearch]
  );

  const handleQueryChange = (e) => {
    setFilter('q', e.target.value);
  };

  const handleClear = () => {
    setFilter('q', '');
    fetchBooks();
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="flex gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            id="search-input"
            value={filters.q}
            onChange={handleQueryChange}
            placeholder="Search by title, author, subject..."
            className="input-field pl-10 pr-10"
            aria-label="Search books"
          />
          {filters.q && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Search button */}
        <button type="submit" className="btn-primary px-6 flex items-center gap-2 whitespace-nowrap">
          <Search size={16} />
          <span className="hidden sm:inline">Search</span>
        </button>

        {/* Filter toggle */}
        {showFilters && (
          <button
            type="button"
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`btn-secondary px-4 flex items-center gap-2 ${showFilterPanel ? 'border-primary-600 text-primary-300' : ''}`}
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Filters</span>
          </button>
        )}
      </form>

      {/* Filter Panel */}
      {showFilters && showFilterPanel && (
        <div className="mt-3 p-4 glass-card rounded-xl border border-surface-border animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setFilter('category', ''); fetchBooks(); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!filters.category ? 'bg-primary-600 text-white' : 'bg-surface-card text-slate-400 hover:text-white border border-surface-border'}`}
                >
                  All
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setFilter('category', cat); fetchBooks(); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filters.category === cat ? 'bg-primary-600 text-white' : 'bg-surface-card text-slate-400 hover:text-white border border-surface-border'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Sort By</label>
              <select
                value={filters.sort}
                onChange={(e) => { setFilter('sort', e.target.value); fetchBooks(); }}
                className="input-field text-sm py-2"
              >
                {SORT_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value} className="bg-surface-card">{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
