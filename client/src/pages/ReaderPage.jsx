import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
  ArrowLeft, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize,
  Minimize, BookmarkPlus, Loader2,
} from 'lucide-react';
import { useBookStore } from '../store/bookStore';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';

// react-pdf v9 — configure PDF.js worker from pdfjs-dist package
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();


const DEBOUNCE_MS = 5000; // Save progress every 5 seconds

export default function ReaderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentBook, signedUrl, currentPage, totalPages, readerLoading, setCurrentPage, loadBookForReading, clearReader } = useBookStore();
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.2);
  const [fullscreen, setFullscreen] = useState(false);
  const [pageInput, setPageInput] = useState('');
  const progressTimer = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    loadBookForReading(id).catch(() => {
      toast.error('Failed to load book');
      navigate('/books');
    });
    return () => {
      clearReader();
      if (progressTimer.current) clearTimeout(progressTimer.current);
    };
  }, [id]);

  // Debounced progress save
  const saveProgress = useCallback(
    (page) => {
      if (progressTimer.current) clearTimeout(progressTimer.current);
      progressTimer.current = setTimeout(async () => {
        try {
          await userAPI.updateProgress(id, { lastPageRead: page, totalPages: numPages || 1 });
        } catch {}
      }, DEBOUNCE_MS);
    },
    [id, numPages]
  );

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const goToPrev = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      saveProgress(newPage);
    }
  };

  const goToNext = () => {
    if (currentPage < numPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      saveProgress(newPage);
    }
  };

  const handlePageInput = (e) => {
    if (e.key === 'Enter') {
      const p = parseInt(pageInput);
      if (p >= 1 && p <= numPages) {
        setCurrentPage(p);
        saveProgress(p);
        setPageInput('');
      } else {
        toast.error(`Enter a page between 1 and ${numPages}`);
      }
    }
  };

  const handleBookmark = async () => {
    try {
      await userAPI.addBookmark(id, { page: currentPage, note: '', label: `Page ${currentPage}` });
      toast.success(`Bookmarked page ${currentPage}`);
    } catch {
      toast.error('Failed to add bookmark');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  };

  if (readerLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface gap-4">
        <Loader2 size={40} className="animate-spin text-primary-500" />
        <p className="text-slate-400">Loading book...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`min-h-screen bg-surface flex flex-col ${fullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Reader Toolbar */}
      <div className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-surface-border">
        <div className="flex items-center justify-between px-4 h-14 gap-4">
          {/* Left */}
          <div className="flex items-center gap-3 min-w-0">
            <Link to={`/books/${id}`} className="btn-ghost p-2 shrink-0">
              <ArrowLeft size={18} />
            </Link>
            <h2 className="text-sm font-medium text-white truncate hidden sm:block">
              {currentBook?.title}
            </h2>
          </div>

          {/* Center — Page nav */}
          <div className="flex items-center gap-2">
            <button onClick={goToPrev} disabled={currentPage === 1} className="btn-secondary p-2 disabled:opacity-40">
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-2 bg-surface-card border border-surface-border rounded-lg px-3 py-1.5">
              <input
                type="number"
                value={pageInput || currentPage}
                onChange={(e) => setPageInput(e.target.value)}
                onKeyDown={handlePageInput}
                onFocus={() => setPageInput('')}
                onBlur={() => setPageInput('')}
                className="w-12 bg-transparent text-white text-center text-sm focus:outline-none"
                min={1}
                max={numPages}
              />
              <span className="text-slate-500 text-sm">/ {numPages || '—'}</span>
            </div>
            <button onClick={goToNext} disabled={currentPage === numPages} className="btn-secondary p-2 disabled:opacity-40">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Right — Controls */}
          <div className="flex items-center gap-1">
            <button onClick={() => setScale((s) => Math.max(0.5, s - 0.2))} className="btn-ghost p-2" title="Zoom out">
              <ZoomOut size={16} />
            </button>
            <span className="text-xs text-slate-400 w-10 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale((s) => Math.min(3, s + 0.2))} className="btn-ghost p-2" title="Zoom in">
              <ZoomIn size={16} />
            </button>
            <button onClick={handleBookmark} className="btn-ghost p-2 hidden sm:block" title="Bookmark page">
              <BookmarkPlus size={16} />
            </button>
            <button onClick={toggleFullscreen} className="btn-ghost p-2" title="Toggle fullscreen">
              {fullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {numPages && (
          <div className="h-0.5 bg-surface-border">
            <div
              className="h-full bg-gradient-to-r from-primary-600 to-violet-600 transition-all duration-300"
              style={{ width: `${(currentPage / numPages) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto flex justify-center p-4 bg-slate-900/50">
        {signedUrl ? (
          <Document
            file={signedUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={() => toast.error('Failed to load PDF')}
            loading={
              <div className="flex items-center gap-3 py-20 text-slate-400">
                <Loader2 size={24} className="animate-spin" /> Loading PDF...
              </div>
            }
          >
            <Page
              pageNumber={currentPage}
              scale={scale}
              className="shadow-2xl rounded"
              renderAnnotationLayer
              renderTextLayer
            />
          </Document>
        ) : (
          <div className="text-slate-400 py-20">No PDF URL available</div>
        )}
      </div>
    </div>
  );
}
