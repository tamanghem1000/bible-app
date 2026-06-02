import { useState } from 'react';
import Navbar from '../components/Navbar';

export default function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [quizState, setQuizState] = useState('setup');
  const [current, setCurrent] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const q = questions[current];

  async function fetchQuestions() {
    const res = await fetch('/api/questions');
    const data = await res.json();
    setQuestions(data.sort(() => Math.random() - 0.5));
    setQuizState('playing');
  }

  async function saveScore() {
    setSaving(true);
    await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score, total: questions.length })
    });
    alert("Score Saved!");
    setQuizState('setup');
    setSaving(false);
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 600, margin: '0 auto', padding: 40, color: '#fff' }}>
        
        {/* SETUP SCREEN */}
        {quizState === 'setup' && (
          <button onClick={fetchQuestions} style={{width: '100%', padding: 20}}>START QUIZ</button>
        )}

        {/* PLAYING SCREEN */}
        {quizState === 'playing' && q && (
          <div>
            <div style={{ color: '#c9a84c', fontSize: '0.8rem' }}>
              {q.category} | {q.difficulty?.toUpperCase()} | {q.book} {q.chapter}
            </div>
            <h2>{q.question}</h2>
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => { setSelected(i); setAnswered(true); if(i === q.answer) setScore(s => s + 1); }}
                disabled={answered}
                style={{ display: 'block', width: '100%', padding: 15, margin: '10px 0', 
                background: answered ? (i === q.answer ? '#4caf7d' : (i === selected ? '#e05252' : '#333')) : '#333' }}>
                {opt}
              </button>
            ))}

            {answered && (
              <div style={{ marginTop: 20, background: '#222', padding: 10 }}>
                <p><strong>Reference:</strong> {q.scripture_reference || 'Not provided'}</p>
                <button onClick={() => current + 1 < questions.length ? (setCurrent(current + 1), setAnswered(false), setSelected(null)) : setQuizState('results')}>
                  {current + 1 < questions.length ? 'NEXT QUESTION' : 'SEE RESULTS'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* RESULTS SCREEN */}
        {quizState === 'results' && (
          <div style={{ textAlign: 'center' }}>
            <h1>Quiz Complete!</h1>
            <h2>You scored {score} out of {questions.length}</h2>
            <input placeholder="Enter your name for leaderboard" onChange={e => setName(e.target.value)} style={{padding: 10, width: '100%', marginBottom: 10}} />
            <button onClick={saveScore} disabled={saving} style={{width: '100%', padding: 15}}>
              {saving ? 'SAVING...' : 'SAVE SCORE & RESTART'}
            </button>
          </div>
        )}
      </main>
    </>
  );
}