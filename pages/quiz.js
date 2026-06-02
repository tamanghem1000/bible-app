import { useState } from 'react';
import Navbar from '../components/Navbar';

export default function QuizPage() {
  const [questions, setQuestions] = useState([]);
  // Setup flow state
  const [quizState, setQuizState] = useState('category'); // category, book, level, playing, finished
  const [selection, setSelection] = useState({ category: '', book: '', level: '' });
  
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  // Mock data structure - replace/extend these as needed
  const books = {
    "Old Testament": ["Genesis", "Exodus"],
    "New Testament": ["Matthew", "John"]
  };

  async function startQuiz() {
    const { category, book, level } = selection;
    const res = await fetch(`/api/questions?book=${book}&level=${level}`);
    const data = await res.json();
    if (data.length === 0) return alert("No questions found for this selection!");
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
    window.location.href = '/leaderboard';
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200">
      <Navbar />
      <main className="max-w-2xl mx-auto p-6 md:p-12 flex flex-col items-center justify-center min-h-[80vh]">
        
        {/* SETUP FLOW */}
        {['category', 'book', 'level'].includes(quizState) && (
          <div className="w-full bg-[#0c0c0c] p-10 rounded-3xl border border-slate-800 shadow-2xl">
            <h1 className="text-3xl font-black text-white mb-6">
              {quizState === 'category' && "Select Category"}
              {quizState === 'book' && "Select Book"}
              {quizState === 'level' && "Select Difficulty"}
            </h1>

            {quizState === 'category' && (
              <div className="grid gap-4">
                {['Old Testament', 'New Testament', 'General'].map(cat => (
                  <button key={cat} onClick={() => { setSelection({...selection, category: cat}); setQuizState(cat === 'General' ? 'level' : 'book'); }}
                    className="p-4 bg-[#151515] border border-slate-800 rounded-2xl hover:border-yellow-600 transition text-left font-bold">
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {quizState === 'book' && (
              <div className="grid gap-4">
                {books[selection.category].map(b => (
                  <button key={b} onClick={() => { setSelection({...selection, book: b}); setQuizState('level'); }}
                    className="p-4 bg-[#151515] border border-slate-800 rounded-2xl hover:border-yellow-600 transition text-left font-bold">
                    {b}
                  </button>
                ))}
              </div>
            )}

            {quizState === 'level' && (
              <div className="grid gap-4">
                {[1, 2, 3].map(lvl => (
                  <button key={lvl} onClick={() => { setSelection({...selection, level: lvl}); startQuiz(); }}
                    className="p-4 bg-[#151515] border border-slate-800 rounded-2xl hover:border-yellow-600 transition text-left font-bold">
                    Level {lvl}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PLAYING SCREEN */}
        {quizState === 'playing' && questions[current] && (
          <div className="w-full animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
              <span className="text-[10px] font-black uppercase tracking-widest text-yellow-600">{questions[current].book} • Ch {questions[current].chapter}</span>
              <span className="text-xs font-bold text-slate-600">{current + 1} / {questions.length}</span>
            </div>
            <div className="bg-[#0c0c0c] p-8 rounded-3xl border border-slate-800 shadow-xl mb-6">
              <h2 className="text-2xl font-bold text-white mb-8">{questions[current].question}</h2>
              <div className="grid gap-4">
                {questions[current].options.map((opt, i) => (
                  <button key={i} onClick={() => { setAnswered(true); if(i === questions[current].answer) setScore(s => s + 1); }}
                    disabled={answered}
                    className={`p-5 rounded-2xl text-left border transition-all ${
                      answered ? (i === questions[current].answer ? 'bg-green-900/20 border-green-600 text-green-500' : 'bg-[#151515] border-slate-800 opacity-50') 
                               : 'bg-[#151515] border-slate-800 hover:border-yellow-600 hover:bg-[#1a1a1a]'
                    }`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            {answered && (
              <div className="bg-yellow-600/10 p-6 rounded-2xl border border-yellow-600/20">
                <p className="text-sm text-yellow-500 mb-4 font-bold">Reference: {questions[current].scripture_reference}</p>
                <button onClick={() => current + 1 < questions.length ? (setCurrent(c => c + 1), setAnswered(false)) : setQuizState('finished')}
                  className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-slate-200 transition">
                  {current + 1 < questions.length ? 'NEXT QUESTION' : 'SEE RESULTS'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* FINISHED SCREEN */}
        {quizState === 'finished' && (
          <div className="bg-[#0c0c0c] p-10 rounded-3xl border border-slate-800 text-center shadow-2xl w-full">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <svg className="w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="#151515" strokeWidth="8" fill="transparent" />
                <circle cx="64" cy="64" r="56" stroke="#eab308" strokeWidth="8" fill="transparent" 
                        strokeDasharray={`${(score / questions.length) * 352} 352`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-black text-2xl">{Math.round((score / questions.length) * 100)}%</div>
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Quiz Complete</h2>
            <input placeholder="Enter name" className="w-full p-4 bg-[#151515] rounded-xl mb-4 border border-slate-800 text-white outline-none focus:border-yellow-600"
              onChange={(e) => setName(e.target.value)} />
            <button onClick={saveScore} disabled={saving || !name} className="w-full bg-yellow-600 text-black p-4 rounded-xl font-bold hover:bg-yellow-500 transition disabled:opacity-50">
              {saving ? 'SAVING...' : 'SAVE SCORE'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}