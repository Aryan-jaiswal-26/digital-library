import { create } from 'zustand';
import { booksAPI } from '../services/api';

export const useBookStore = create((set, get) => ({
  // ─── Catalog State ──────────────────────────────────────────────────────────
  books: [],
  pagination: { total: 0, page: 1, totalPages: 1 },
  filters: { q: '', category: '', sort: 'newest', page: 1, limit: 12 },
  loading: false,
  error: null,

  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value, page: 1 }, // reset page on filter change
    }));
  },

  fetchBooks: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      // Remove empty filters
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const res = await booksAPI.getAll(params);
      set({
        books: res.data.data,
        pagination: res.data.pagination,
        loading: false,
      });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load books', loading: false });
    }
  },

  // ─── Reader State ───────────────────────────────────────────────────────────
  currentBook: null,
  signedUrl: null,
  currentPage: 1,
  totalPages: 0,
  readerLoading: false,

  setCurrentPage: (page) => set({ currentPage: page }),

  loadBookForReading: async (bookId) => {
    set({ readerLoading: true });
    try {
      const [bookRes, urlRes] = await Promise.all([
        booksAPI.getOne(bookId),
        booksAPI.getReadUrl(bookId),
      ]);
      set({
        currentBook: bookRes.data.data,
        signedUrl: urlRes.data.data.signedUrl,
        totalPages: urlRes.data.data.totalPages || 0,
        currentPage: 1,
        readerLoading: false,
      });
    } catch (err) {
      set({ readerLoading: false });
      throw err;
    }
  },

  clearReader: () => set({ currentBook: null, signedUrl: null, currentPage: 1, totalPages: 0 }),

  // ─── Featured / Home ────────────────────────────────────────────────────────
  featuredBooks: [],
  featuredLoading: false,

  fetchFeatured: async () => {
    set({ featuredLoading: true });
    try {
      const res = await booksAPI.getAll({ sort: 'rating', limit: 6 });
      set({ featuredBooks: res.data.data, featuredLoading: false });
    } catch {
      set({ featuredLoading: false });
    }
  },
}));
