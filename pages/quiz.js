import { useState } from 'react';
import Navbar from '../components/Navbar';

export default function QuizPage() {
  const [quizState, setQuizState] = useState('category');
  const [selection, setSelection] = useState({ category: '', book: '', level: '' });
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  // NEW: Track user attempts for the summary
  const [attempts, setAttempts] = useState([]);

  const books = {
    "Old Testament": ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"],
    "New Testament": ["Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"]
  };

  async function startQuiz(level, book) {
    const url = `/api/questions?difficulty=${level}&book=${encodeURIComponent(book || 'General')}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (!data || data.length === 0) { alert(`No questions found.`); return; }
      setQuestions(data.sort(() => Math.random() - 0.5));
      setAttempts([]); setScore(0); setCurrent(0); setQuizState('playing');
    } catch (err) { console.error(err); }
  }

  function handleAnswer(index) {
    if (answered) return;
    setAnswered(true);
    const isCorrect = index === questions[current].answer;
    if (isCorrect) setScore(s => s + 1);
    setAttempts([...attempts, { question: questions[current].question, options: questions[current].options, selected: index, correct: questions[current].answer }]);
  }

  async function saveScore() {
    if (!name.trim()) return alert("Enter name!");
    setSaving(true);
    try {
      const res = await fetch('/api/leaderboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim(), score: score, total: questions.length }) });
      if (res.ok) { window.location.href = '/leaderboard'; }
      else { throw new Error("Failed"); }
    } catch (err) { alert(err.message); setSaving(false); }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200">
      <Navbar />
      <main className="max-w-2xl mx-auto p-6">
        {quizState === 'category' && (
          <div className="grid gap-4">
            <h1 className="text-2xl font-bold mb-4">Select Category</h1>
            {['Old Testament', 'New Testament', 'General'].map(cat => (
              <button key={cat} onClick={() => { setSelection({...selection, category: cat}); setQuizState(cat === 'General' ? 'level' : 'book'); }} className="p-6 bg-[#151515] border border-slate-800 rounded-2xl hover:border-yellow-600">{cat}</button>
            ))}
          </div>
        )}
        {quizState === 'book' && (
          <div className="grid grid-cols-2 gap-2 h-96 overflow-y-auto p-2">
            {books[selection.category].map(b => (
              <button key={b} onClick={() => { setSelection({...selection, book: b}); setQuizState('level'); }} className="p-3 bg-[#151515] border border-slate-800 rounded-lg text-xs hover:border-yellow-600">{b}</button>
            ))}
          </div>
        )}
        {quizState === 'level' && (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(10)].map((_, i) => (
              <button key={i+1} onClick={() => { const level = i + 1; setSelection({...selection, level: level}); startQuiz(level, selection.book || 'General'); }} className="p-6 bg-[#151515] border border-slate-800 rounded-2xl hover:border-yellow-600">Level {i+1}</button>
            ))}
          </div>
        )}
        {quizState === 'playing' && questions[current] && (
          <div className="bg-[#0c0c0c] p-8 rounded-3xl border border-slate-800">
            <h2 className="text-xl font-bold mb-6">{questions[current].question}</h2>
            <div className="grid gap-3">
              {questions[current].options.map((opt, i) => (
                <button key={i} onClick={() => handleAnswer(i)} className={`p-4 rounded-xl border ${answered && i === questions[current].answer ? 'bg-green-600/20 border-green-500' : answered && i !== questions[current].answer ? 'opacity-50 border-slate-800' : 'bg-[#151515] border-slate-800'}`}>
                  {opt}
                </button>
              ))}
            </div>
            {answered && (
              <button className="mt-6 w-full bg-yellow-600 py-3 rounded-xl font-bold" onClick={() => { if(current + 1 < questions.length) { setCurrent(current + 1); setAnswered(false); } else { setQuizState('finished'); } }}>Next</button>
            )}
          </div>
        )}
        {quizState === 'finished' && (
          <div className="space-y-6">
            <div className="bg-[#0c0c0c] p-10 rounded-3xl text-center border border-slate-800">
              <h2 className="text-3xl font-black text-yellow-500 mb-6">Quiz Finished!</h2>
              <p className="text-xl font-bold mb-6">Score: {score} / {questions.length}</p>
              <input className="w-full p-4 bg-[#151515] border border-slate-800 rounded-xl mb-4 text-white text-center" placeholder="Enter name" onChange={(e) => setName(e.target.value)} />
              <button onClick={saveScore} className="w-full bg-yellow-600 py-4 rounded-xl font-bold">SAVE SCORE</button>
            </div>
            
            {/* Correction Section */}
            <h3 className="text-xl font-bold mt-10">Level {selection.level} Correction</h3>
            {attempts.map((a, i) => (
              <div key={i} className="bg-[#0c0c0c] p-6 rounded-2xl border border-slate-800 mb-4">
                <p className="font-bold mb-4">{i+1}. {a.question}</p>
                <div className="grid gap-2 text-sm">
                  <p className={a.selected === a.correct ? "text-green-400" : "text-red-400"}>
                    Your answer: {a.options[a.selected]} {a.selected === a.correct ? '(Correct)' : '(Wrong)'}
                  </p>
                  {a.selected !== a.correct && <p className="text-green-400">Correct answer: {a.options[a.correct]}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}