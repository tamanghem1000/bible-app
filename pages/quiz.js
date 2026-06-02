import Head from 'next/head';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

export default function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizState, setQuizState] = useState('setup');
  const [filters, setFilters] = useState({ category: 'All', difficulty: 'All', book: '', chapter: '' });
  
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [shuffled, setShuffled] = useState([]);

  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  async function fetchQuestions() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.category !== 'All') params.set('category', filters.category);
    if (filters.difficulty !== 'All') params.set('difficulty', filters.difficulty);
    if (filters.book.trim()) params.set('book', filters.book.trim());
    if (filters.chapter) params.set('chapter', filters.chapter);
    
    try {
      const res = await fetch(`/api/questions?${params.toString()}`);
      const data = await res.json();
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) { setQuestions([]); } 
    finally { setLoading(false); }
  }

  function startQuiz() {
    const q = [...questions].sort(() => Math.random() - 0.5);
    setShuffled(q);
    setCurrent(0); setScore(0); setSelected(null); setAnswered(false);
    setQuizState('playing');
  }

  function handleSelect(idx) {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === shuffled[current].answer) setScore(s => s + 1);
  }

  function next() {
    if (current + 1 >= shuffled.length) setQuizState('results');
    else { setCurrent(c => c + 1); setSelected(null); setAnswered(false); }
  }

  const q = shuffled[current];

  return (
    <>
      <Head><title>Bible Quiz</title></Head>
      <Navbar />
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px' }}>
        
        {/* SETUP SCREEN */}
        {quizState === 'setup' && (
          <div className="fade-in">
            <h1 style={{ textAlign: 'center', color: '#f5f0e8' }}>Bible Quiz</h1>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 28, borderRadius: 8, marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <select onChange={e => setFilters({...filters, category: e.target.value})} style={{ padding: 10 }}>
                  {['All', 'Old Testament', 'New Testament', 'General'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input placeholder="Book (e.g. Genesis)" onChange={e => setFilters({...filters, book: e.target.value})} style={{ padding: 10 }} />
                <input type="number" placeholder="Chapter" onChange={e => setFilters({...filters, chapter: e.target.value})} style={{ padding: 10 }} />
              </div>
            </div>
            <button onClick={startQuiz} disabled={loading || questions.length === 0} style={{ width: '100%', padding: 18, background: '#c9a84c' }}>
              {loading ? 'LOADING...' : questions.length === 0 ? 'NO QUESTIONS FOUND' : `START QUIZ (${questions.length})`}
            </button>
          </div>
        )}

        {/* PLAYING SCREEN */}
        {quizState === 'playing' && q && (
          <div className="fade-in">
            <span style={{ fontSize: '0.7rem', color: '#c9a84c', border: '1px solid #c9a84c', padding: '4px 8px', borderRadius: 4 }}>
              {q.difficulty?.toUpperCase()}
            </span>
            <h2 style={{ color: '#fff', marginTop: 15 }}>{q.question}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {q.options.map((opt, i) => {
                let bg = 'rgba(255,255,255,0.05)';
                if (answered) {
                  if (i === q.answer) bg = '#4caf7d'; // Correct (Green)
                  else if (i === selected) bg = '#e05252'; // Wrong (Red)
                }
                return (
                  <button key={i} onClick={() => handleSelect(i)} disabled={answered}
                    style={{ padding: 16, background: bg, border: '1px solid #c9a84c', color: '#fff', textAlign: 'left' }}>
                    {opt}
                  </button>
                );
              })}
            </div>
            {answered && (
              <button onClick={next} style={{ marginTop: 20, width: '100%', padding: 15, background: '#c9a84c' }}>
                {current + 1 >= shuffled.length ? 'SEE RESULTS' : 'NEXT QUESTION'}
              </button>
            )}
          </div>
        )}

        {/* RESULTS SCREEN */}
        {quizState === 'results' && (
          <div style={{ textAlign: 'center', color: '#fff' }}>
            <h1>Quiz Complete!</h1>
            <p>Score: {score} / {shuffled.length}</p>
            <button onClick={() => setQuizState('setup')}>TRY AGAIN</button>
          </div>
        )}
      </main>
    </>
  );
}