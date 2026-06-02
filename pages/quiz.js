import { useState } from 'react';

export default function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [selectedBook, setSelectedBook] = useState('Genesis');
  const [quizState, setQuizState] = useState('setup'); // setup, playing, finished
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  async function startQuiz() {
    const res = await fetch(`/api/questions?book=${selectedBook}`);
    const data = await res.json();
    if (data.length === 0) return alert("No questions found for this book!");
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
    setScore(0);
    setCurrent(0);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center">
      
      {/* SETUP SCREEN */}
      {quizState === 'setup' && (
        <div className="w-full max-w-md bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800">
          <h1 className="text-4xl font-bold mb-6 text-yellow-500">Bible Quiz</h1>
          <label className="block mb-2 text-sm text-gray-400">Select Book</label>
          <select 
            className="w-full p-4 bg-slate-800 rounded-xl mb-6 border border-slate-700 focus:ring-2 focus:ring-yellow-500 outline-none"
            value={selectedBook}
            onChange={(e) => setSelectedBook(e.target.value)}
          >
            <option value="Genesis">Genesis</option>
            <option value="Exodus">Exodus</option>
            <option value="Matthew">Matthew</option>
            <option value="John">John</option>
          </select>
          <button onClick={startQuiz} className="w-full bg-yellow-600 hover:bg-yellow-500 p-4 rounded-xl font-bold transition transform hover:scale-[1.02]">
            START QUIZ
          </button>
        </div>
      )}

      {/* PLAYING SCREEN */}
      {quizState === 'playing' && questions[current] && (
        <div className="w-full max-w-2xl bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex justify-between text-yellow-500 text-xs font-bold uppercase mb-4">
            <span>{questions[current].book} {questions[current].chapter}</span>
            <span>Question {current + 1} / {questions.length}</span>
          </div>
          <h2 className="text-2xl font-medium mb-8">{questions[current].question}</h2>
          
          <div className="grid gap-3">
            {questions[current].options.map((opt, i) => (
              <button 
                key={i} 
                onClick={() => { setAnswered(true); if(i === questions[current].answer) setScore(s => s + 1); }}
                disabled={answered}
                className={`p-4 rounded-xl text-left border transition-all ${
                  answered ? (i === questions[current].answer ? 'bg-green-800 border-green-600' : 'bg-slate-800 border-slate-700 opacity-50') 
                           : 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-yellow-600'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {answered && (
            <div className="mt-8 p-6 bg-slate-950 rounded-2xl border-l-4 border-yellow-500">
              <p className="text-sm text-slate-400 mb-4">Reference: <span className="text-yellow-500 font-bold">{questions[current].scripture_reference}</span></p>
              <button 
                onClick={() => current + 1 < questions.length ? (setCurrent(c => c + 1), setAnswered(false)) : setQuizState('finished')}
                className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold hover:bg-yellow-400 transition"
              >
                {current + 1 < questions.length ? 'NEXT QUESTION' : 'SEE RESULTS'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* FINISHED SCREEN */}
      {quizState === 'finished' && (
        <div className="w-full max-w-md bg-slate-900 p-8 rounded-3xl text-center border border-slate-800 shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>
          <p className="text-xl mb-6 text-yellow-500">You scored {score} / {questions.length}</p>
          <input 
            placeholder="Enter your name" 
            className="w-full p-4 bg-slate-800 rounded-xl mb-4 border border-slate-700 text-white"
            onChange={(e) => setName(e.target.value)}
          />
          <button 
            onClick={saveScore} 
            disabled={saving || !name}
            className="w-full bg-yellow-600 p-4 rounded-xl font-bold hover:bg-yellow-500 disabled:opacity-50"
          >
            {saving ? 'SAVING...' : 'SAVE SCORE & RESTART'}
          </button>
        </div>
      )}
    </div>
  );
}