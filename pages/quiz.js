import Head from 'next/head';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

const CATEGORY_COLORS = {
  'Old Testament': '#8b6914',
  'New Testament': '#1a4d8b',
  'General': '#3a6b3a',
};

export default function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizState, setQuizState] = useState('setup'); // setup | playing | results
  const [filters, setFilters] = useState({ category: 'All', difficulty: 'All' });
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
    const res = await fetch(`/api/questions?${params}`);
    const data = await res.json();
    setQuestions(data);
    setLoading(false);
  }

  function startQuiz() {
    const q = [...questions].sort(() => Math.random() - 0.5);
    setShuffled(q);
    setCurrent(0);
    setScore(0);
    setAnswers([]);
    setSelected(null);
    setAnswered(false);
    setQuizState('playing');
  }

  function handleSelect(idx) {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const q = shuffled[current];
    const correct = idx === q.answer;
    if (correct) setScore(s => s + 1);
    setAnswers(a => [...a, { question: q.question, selected: idx, correct: q.answer, isCorrect: correct }]);
  }

  function next() {
    if (current + 1 >= shuffled.length) {
      setQuizState('results');
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  }

  const q = shuffled[current];
  const pct = shuffled.length > 0 ? ((current + 1) / shuffled.length) * 100 : 0;
  const scorePct = shuffled.length > 0 ? Math.round((score / shuffled.length) * 100) : 0;

  return (
    <>
      <Head>
        <title>Bible Quiz — Sacred Word</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navbar />

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* SETUP SCREEN */}
        {quizState === 'setup' && (
          <div className="fade-in">
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '0.2em', color: '#c9a84c', marginBottom: 12 }}>
                TEST YOUR KNOWLEDGE
              </p>
              <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(2rem, 6vw, 3rem)', color: '#f5f0e8', marginBottom: 16 }}>
                Bible Quiz
              </h1>
              <p style={{ color: 'rgba(245,240,232,0.55)', fontFamily: 'Playfair Display, serif', fontSize: '1.05rem' }}>
                Answer questions about the Old and New Testament
              </p>
            </div>

            {/* Filters */}
            <div className="card" style={{ padding: 28, marginBottom: 28 }}>
              <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '0.85rem', letterSpacing: '0.1em', color: '#c9a84c', marginBottom: 20 }}>
                CUSTOMIZE YOUR QUIZ
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(245,240,232,0.5)', marginBottom: 8, fontFamily: 'Cinzel, serif', letterSpacing: '0.06em' }}>
                    CATEGORY
                  </label>
                  <select
                    value={filters.category}
                    onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.25)', color: '#f5f0e8', borderRadius: 4, fontSize: '0.9rem' }}
                  >
                    {['All', 'Old Testament', 'New Testament', 'General'].map(c => (
                      <option key={c} value={c} style={{ background: '#0d1b3e' }}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(245,240,232,0.5)', marginBottom: 8, fontFamily: 'Cinzel, serif', letterSpacing: '0.06em' }}>
                    DIFFICULTY
                  </label>
                  <select
                    value={filters.difficulty}
                    onChange={e => setFilters(f => ({ ...f, difficulty: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.25)', color: '#f5f0e8', borderRadius: 4, fontSize: '0.9rem' }}
                  >
                    {['All', 'easy', 'medium', 'hard'].map(d => (
                      <option key={d} value={d} style={{ background: '#0d1b3e' }}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Stats */}
            {!loading && (
              <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
                {[
                  { label: 'Available Questions', value: questions.length },
                  { label: 'Categories', value: [...new Set(questions.map(q => q.category))].length },
                ].map(s => (
                  <div key={s.label} className="card" style={{ flex: 1, minWidth: 140, padding: '20px 24px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1.8rem', color: '#c9a84c', marginBottom: 4 }}>{s.value}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(245,240,232,0.45)', letterSpacing: '0.05em' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={startQuiz}
              disabled={loading || questions.length === 0}
              className="btn-gold"
              style={{ width: '100%', padding: '18px', fontSize: '1rem', letterSpacing: '0.12em', opacity: questions.length === 0 ? 0.4 : 1 }}
            >
              {loading ? 'LOADING...' : questions.length === 0 ? 'NO QUESTIONS FOUND' : `START QUIZ — ${questions.length} QUESTIONS`}
            </button>
          </div>
        )}

        {/* PLAYING SCREEN */}
        {quizState === 'playing' && q && (
          <div className="fade-in">
            {/* Progress bar */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.8rem', fontFamily: 'Cinzel, serif', color: 'rgba(201,168,76,0.7)', letterSpacing: '0.08em' }}>
                <span>QUESTION {current + 1} OF {shuffled.length}</span>
                <span>SCORE: {score}</span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #c9a84c, #e8c87a)', transition: 'width 0.4s ease', borderRadius: 2 }} />
              </div>
            </div>

            {/* Question card */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
              {/* Image */}
              {q.image && (
                <div style={{ height: 220, overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={q.image}
                    alt="Question visual"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.parentElement.style.display = 'none'; }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(13,27,62,0.9))' }} />
                </div>
              )}

              <div style={{ padding: '28px 28px 24px' }}>
                {/* Badge */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.72rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.06em', background: 'rgba(201,168,76,0.12)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.25)' }}>
                    {q.category}
                  </span>
                  <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.72rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.05)', color: 'rgba(245,240,232,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {q.difficulty}
                  </span>
                </div>

                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.05rem, 3vw, 1.35rem)', lineHeight: 1.5, color: '#f5f0e8', marginBottom: 8 }}>
                  {q.question}
                </h2>
                {q.reference && (
                  <p style={{ fontSize: '0.75rem', color: 'rgba(201,168,76,0.5)', fontFamily: 'Cinzel, serif', letterSpacing: '0.06em' }}>
                    {q.reference}
                  </p>
                )}
              </div>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {q.options.map((opt, idx) => {
                let cls = 'quiz-option';
                if (answered) {
                  if (idx === q.answer) cls += ' correct';
                  else if (idx === selected) cls += ' wrong';
                }
                return (
                  <button key={idx} className={cls} onClick={() => handleSelect(idx)} disabled={answered}>
                    <span style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      <span style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Cinzel, serif', fontSize: '0.75rem', fontWeight: 700,
                        background: answered && idx === q.answer ? '#4caf7d' : answered && idx === selected ? '#e05252' : 'rgba(201,168,76,0.15)',
                        color: answered && (idx === q.answer || idx === selected) ? 'white' : '#c9a84c',
                      }}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Feedback & Next */}
            {answered && (
              <div className="fade-in" style={{ textAlign: 'center' }}>
                <p style={{
                  marginBottom: 16, fontFamily: 'Playfair Display, serif', fontSize: '1.05rem',
                  color: selected === q.answer ? '#4caf7d' : '#e05252',
                }}>
                  {selected === q.answer ? '✓ Correct!' : `✗ The correct answer is: ${q.options[q.answer]}`}
                </p>
                <button onClick={next} className="btn-gold" style={{ padding: '14px 40px', fontSize: '0.9rem' }}>
                  {current + 1 >= shuffled.length ? 'SEE RESULTS' : 'NEXT QUESTION →'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* RESULTS SCREEN */}
        {quizState === 'results' && (
          <div className="fade-in" style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: 40 }}>
              <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '0.2em', color: '#c9a84c', marginBottom: 16 }}>
                QUIZ COMPLETE
              </p>
              {/* Score circle */}
              <div style={{
                width: 160, height: 160, borderRadius: '50%', margin: '0 auto 28px',
                background: `conic-gradient(#c9a84c ${scorePct * 3.6}deg, rgba(255,255,255,0.08) 0)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 40px rgba(201,168,76,0.2)',
              }}>
                <div style={{ width: 130, height: 130, borderRadius: '50%', background: '#0d1b3e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: '2.2rem', color: '#e8c87a', fontWeight: 700 }}>{scorePct}%</span>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(245,240,232,0.4)', letterSpacing: '0.06em' }}>{score}/{shuffled.length}</span>
                </div>
              </div>

              <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(1.3rem, 4vw, 2rem)', color: '#f5f0e8', marginBottom: 8 }}>
                {scorePct >= 80 ? '🏆 Excellent!' : scorePct >= 60 ? '👍 Well Done!' : scorePct >= 40 ? '📖 Keep Studying' : '🙏 Keep Faith'}
              </h2>
              <p style={{ color: 'rgba(245,240,232,0.5)', fontFamily: 'Playfair Display, serif' }}>
                You got {score} out of {shuffled.length} questions correct
              </p>
            </div>

            {/* Review */}
            <div className="card" style={{ padding: 24, marginBottom: 32, textAlign: 'left' }}>
              <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '0.8rem', letterSpacing: '0.12em', color: '#c9a84c', marginBottom: 20 }}>
                REVIEW ANSWERS
              </h3>
              {answers.map((a, i) => (
                <div key={i} style={{ borderBottom: i < answers.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', paddingBottom: 14, marginBottom: 14 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 2 }}>{a.isCorrect ? '✅' : '❌'}</span>
                    <div>
                      <p style={{ fontSize: '0.9rem', color: '#f5f0e8', marginBottom: 4, lineHeight: 1.4 }}>{a.question}</p>
                      {!a.isCorrect && (
                        <p style={{ fontSize: '0.8rem', color: '#4caf7d' }}>
                          Correct: {shuffled[i]?.options[a.correct]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={startQuiz} className="btn-gold" style={{ padding: '14px 32px', fontSize: '0.9rem' }}>
                PLAY AGAIN
              </button>
              <button onClick={() => setQuizState('setup')} className="btn-outline" style={{ padding: '14px 32px', fontSize: '0.85rem' }}>
                CHANGE SETTINGS
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
