import Head from 'next/head';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { BIBLE_BOOKS, OT_BOOKS, NT_BOOKS } from '../lib/bibleBooks';

export default function BiblePage() {
  const [selectedBook, setSelectedBook] = useState(BIBLE_BOOKS[0]);
  const [chapter, setChapter] = useState(1);
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [testament, setTestament] = useState('OT');
  const [bookSearch, setBookSearch] = useState('');

  const books = testament === 'OT' ? OT_BOOKS : NT_BOOKS;
  const filteredBooks = bookSearch
    ? BIBLE_BOOKS.filter(b => b.name.toLowerCase().includes(bookSearch.toLowerCase()))
    : books;

  useEffect(() => {
    loadChapter();
  }, [selectedBook, chapter]);

  async function loadChapter() {
    setLoading(true);
    setError('');
    setVerses([]);
    try {
      const res = await fetch(`/api/bible?book=${selectedBook.name}&chapter=${chapter}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setVerses(data.verses || []);
    } catch (e) {
      setError('Could not load this chapter. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function selectBook(book) {
    setSelectedBook(book);
    setChapter(1);
    setSidebarOpen(false);
    setBookSearch('');
  }

  function prevChapter() { if (chapter > 1) setChapter(c => c - 1); }
  function nextChapter() { if (chapter < selectedBook.chapters) setChapter(c => c + 1); }

  return (
    <>
      <Head>
        <title>Bible Browser — Sacred Word</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navbar />

      <div style={{ display: 'flex', maxWidth: 1300, margin: '0 auto', minHeight: 'calc(100vh - 60px)', position: 'relative' }}>
        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40, display: 'none' }}
            className="sidebar-overlay"
          />
        )}

        {/* Sidebar */}
        <aside style={{
          width: 260,
          flexShrink: 0,
          borderRight: '1px solid rgba(201,168,76,0.15)',
          padding: '24px 0',
          position: 'sticky',
          top: 60,
          height: 'calc(100vh - 60px)',
          overflowY: 'auto',
          background: 'rgba(13,27,62,0.8)',
        }} className={`bible-sidebar${sidebarOpen ? ' open' : ''}`}>
          {/* Testament toggle */}
          <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8 }}>
            {['OT', 'NT'].map(t => (
              <button key={t} onClick={() => setTestament(t)} style={{
                flex: 1, padding: '8px 0', fontFamily: 'Cinzel, serif', fontSize: '0.75rem',
                letterSpacing: '0.08em', cursor: 'pointer', borderRadius: 4, transition: 'all 0.2s',
                background: testament === t ? 'linear-gradient(135deg,#c9a84c,#e8c87a)' : 'rgba(255,255,255,0.05)',
                color: testament === t ? '#1a1209' : '#c9a84c',
                border: testament === t ? 'none' : '1px solid rgba(201,168,76,0.3)',
                fontWeight: 600,
              }}>
                {t === 'OT' ? 'Old' : 'New'}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ padding: '0 16px 12px' }}>
            <input
              value={bookSearch}
              onChange={e => setBookSearch(e.target.value)}
              placeholder="Search books..."
              style={{
                width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(201,168,76,0.2)', borderRadius: 4, color: '#f5f0e8',
                fontSize: '0.85rem', outline: 'none',
              }}
            />
          </div>

          {/* Book list */}
          <div>
            {filteredBooks.map(book => (
              <button
                key={book.id}
                onClick={() => selectBook(book)}
                style={{
                  width: '100%', textAlign: 'left', padding: '9px 20px',
                  background: selectedBook.id === book.id ? 'rgba(201,168,76,0.12)' : 'transparent',
                  borderLeft: selectedBook.id === book.id ? '3px solid #c9a84c' : '3px solid transparent',
                  color: selectedBook.id === book.id ? '#e8c87a' : 'rgba(245,240,232,0.65)',
                  fontSize: '0.88rem', cursor: 'pointer', border: 'none',
                  fontFamily: 'Lato, sans-serif', transition: 'all 0.15s',
                }}
              >
                {book.name}
              </button>
            ))}
          </div>
        </aside>

        {/* Main reader */}
        <main style={{ flex: 1, padding: '32px 24px', maxWidth: 720, margin: '0 auto' }} className="fade-in">
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="mobile-sidebar-btn"
              style={{ background: 'none', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem', display: 'none' }}
            >
              ☰ Books
            </button>

            <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', color: '#e8c87a', flex: 1 }}>
              {selectedBook.name}
            </h1>

            {/* Chapter picker */}
            <select
              value={chapter}
              onChange={e => setChapter(Number(e.target.value))}
              style={{
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(201,168,76,0.3)',
                color: '#f5f0e8', padding: '6px 10px', borderRadius: 4, fontSize: '0.85rem',
                cursor: 'pointer', fontFamily: 'Cinzel, serif',
              }}
            >
              {Array.from({ length: selectedBook.chapters }, (_, i) => (
                <option key={i+1} value={i+1} style={{ background: '#0d1b3e' }}>
                  Chapter {i+1}
                </option>
              ))}
            </select>
          </div>

          <div className="divider" />

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <button
              onClick={prevChapter} disabled={chapter === 1}
              className="btn-outline" style={{ padding: '8px 18px', fontSize: '0.8rem', opacity: chapter === 1 ? 0.3 : 1 }}
            >
              ← Previous
            </button>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.8rem', color: 'rgba(201,168,76,0.6)', letterSpacing: '0.1em' }}>
              CH. {chapter} / {selectedBook.chapters}
            </span>
            <button
              onClick={nextChapter} disabled={chapter === selectedBook.chapters}
              className="btn-outline" style={{ padding: '8px 18px', fontSize: '0.8rem', opacity: chapter === selectedBook.chapters ? 0.3 : 1 }}
            >
              Next →
            </button>
          </div>

          {/* Content */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div className="loading-pulse" style={{ fontFamily: 'Cinzel, serif', color: '#c9a84c', letterSpacing: '0.15em', fontSize: '0.85rem' }}>
                LOADING SCRIPTURE...
              </div>
            </div>
          )}

          {error && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#e05252' }}>
              <p style={{ marginBottom: 16 }}>{error}</p>
              <button onClick={loadChapter} className="btn-outline" style={{ padding: '8px 20px' }}>Retry</button>
            </div>
          )}

          {!loading && !error && verses.length > 0 && (
            <div className="parchment-bg fade-in" style={{ borderRadius: 8, padding: 'clamp(20px, 5vw, 48px)', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}>
              <h2 className="chapter-title" style={{ fontSize: '1rem', letterSpacing: '0.12em', marginBottom: 28 }}>
                {selectedBook.name.toUpperCase()} — CHAPTER {chapter}
              </h2>
              <div>
                {verses.map(v => (
                  <div key={v.verse} style={{ marginBottom: 24, display: 'flex', gap: 14 }}>
                    {/* Verse Number Column */}
                    <sup style={{ 
                      fontFamily: 'Cinzel, serif', 
                      fontSize: '0.75rem', 
                      color: '#c9a84c', 
                      fontWeight: 700, 
                      minWidth: 24, 
                      paddingTop: 4, 
                      flexShrink: 0 
                    }}>
                      {v.verse}
                    </sup>
                    
                    {/* Parallel Translations Stack */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                      {/* English Text */}
                      <span style={{ 
                        fontSize: '1.05rem', 
                        lineHeight: '1.6', 
                        color: '#f5f0e8', 
                        fontFamily: 'Lora, Georgia, serif' 
                      }}>
                        {v.text_en}
                      </span>
                      {/* Nepali Text */}
                      <span style={{ 
                        fontSize: '1.15rem', 
                        lineHeight: '1.7', 
                        color: 'rgba(245,240,232,0.75)', 
                        fontFamily: 'Mukta, Kalimati, sans-serif' 
                      }}>
                        {v.text_ne}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom nav */}
              <div className="divider" style={{ marginTop: 36 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={prevChapter} disabled={chapter === 1} className="btn-outline" style={{ padding: '8px 18px', fontSize: '0.8rem', opacity: chapter === 1 ? 0.3 : 1 }}>
                  ← Prev
                </button>
                <button onClick={nextChapter} disabled={chapter === selectedBook.chapters} className="btn-outline" style={{ padding: '8px 18px', fontSize: '0.8rem', opacity: chapter === selectedBook.chapters ? 0.3 : 1 }}>
                  Next →
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .bible-sidebar {
            position: fixed !important;
            left: -280px;
            top: 60px !important;
            height: calc(100vh - 60px) !important;
            z-index: 50;
            transition: left 0.3s ease;
            box-shadow: 4px 0 20px rgba(0,0,0,0.5);
          }
          .bible-sidebar.open { left: 0 !important; }
          .sidebar-overlay { display: block !important; }
          .mobile-sidebar-btn { display: block !important; }
        }
      `}</style>
    </>
  );
}