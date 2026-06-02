import Head from 'next/head';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

export default function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizState, setQuizState] = useState('setup');
  // UPDATED: Added book and chapter to filters
  const [filters, setFilters] = useState({ 
    category: 'All', 
    difficulty: 'All', 
    book: '', 
    chapter: '' 
  });
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [shuffled, setShuffled] = useState([]);

  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  async function fetchQuestions() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.category !== 'All') params.set('category', filters.category);
    if (filters.difficulty !== 'All') params.set('difficulty', filters.difficulty);
    if (filters.book) params.set('book', filters.book);
    if (filters.chapter) params.set('chapter', filters.chapter);
    
    const res = await fetch(`/api/questions?${params}`);
    const data = await res.json();
    setQuestions(data);
    setLoading(false);
  }

  // ... keep startQuiz, handleSelect, and next functions exactly as they were ...
  function startQuiz() {
    const q = [...questions].sort(() => Math.random() - 0.5);
    setShuffled(q);
    setCurrent(0); setScore(0); setAnswers([]); setSelected(null); setAnswered(false);
    setQuizState('playing');
  }

  function handleSelect(idx) {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const q = shuffled[current];
    if (idx === q.answer) setScore(s => s + 1);
    setAnswers(a => [...a, { question: q.question, selected: idx, correct: q.answer, isCorrect: idx === q.answer }]);
  }

  function next() {
    if (current + 1 >= shuffled.length) setQuizState('results');
    else { setCurrent(c => c + 1); setSelected(null); setAnswered(false); }
  }

  const q = shuffled[current];
  const pct = shuffled.length > 0 ? ((current + 1) / shuffled.length) * 100 : 0;
  const scorePct = shuffled.length > 0 ? Math.round((score / shuffled.length) * 100) : 0;

  return (
    <>
      <Head><title>Bible Quiz — Sacred Word</title></Head>
      <Navbar />
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px 80px' }}>
        {quizState === 'setup' && (
          <div className="fade-in">
            <h1 style={{ textAlign: 'center', fontFamily: 'Cinzel, serif', color: '#f5f0e8' }}>Bible Quiz</h1>
            
            <div className="card" style={{ padding: 28, marginBottom: 28 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* EXISTING FILTERS */}
                <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))} style={{ padding: 10, background: 'rgba(255,255,255,0.06)', color: '#fff' }}>
                  {['All', 'Old Testament', 'New Testament', 'General'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                
                {/* NEW FILTER INPUTS */}
                <input placeholder="Book (e.g. Genesis)" value={filters.book} onChange={e => setFilters(f => ({...f, book: e.target.value}))} style={{ padding: 10, background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(201,168,76,0.25)' }} />
                <input type="number" placeholder="Chapter" value={filters.chapter} onChange={e => setFilters(f => ({...f, chapter: e.target.value}))} style={{ padding: 10, background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(201,168,76,0.25)' }} />
              </div>
            </div>

            <button onClick={startQuiz} className="btn-gold" style={{ width: '100%', padding: '18px' }} disabled={loading || questions.length === 0}>
              {loading ? 'LOADING...' : questions.length === 0 ? 'NO QUESTIONS FOUND' : `START QUIZ (${questions.length})`}
            </button>
          </div>
        )}
        
        {/* ... Rest of your playing/results screen logic remains exactly the same ... */}
        {quizState !== 'setup' && (
           /* Your existing playing and results rendering code goes here */
           <div style={{ color: '#fff' }}> {/* Just a placeholder for your existing JSX */} </div>
        )}
      </main>
    </>
  );
}