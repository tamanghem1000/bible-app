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

  const books = {
    "Old Testament": ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"],
    "New Testament": ["Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"]
  };

  async function startQuiz() {
    const bookParam = selection.category === 'General' ? 'General' : selection.book;
    const res = await fetch(`/api/questions?book=${encodeURIComponent(bookParam)}&difficulty=${selection.level}`);
    const data = await res.json();
    if (data.length === 0) return alert("No questions found for this selection!");
    setQuestions(data.sort(() => Math.random() - 0.5));
    setQuizState('playing');
  }

  async function saveScore() {
    if (!name.trim()) return alert("Please enter your name!");
    setSaving(true);
    const res = await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score, total: questions.length })
    });
    if (res.ok) {
      window.location.href = '/leaderboard';
    } else {
      alert("Failed to save score. Please try again.");
      setSaving(false);
    }
  }

  const getResults = (percentage) => {
    if (percentage >= 90) return { title: "Scripture Master", verse: "His lord said unto him, Well done, good and faithful servant. — Matthew 25:21" };
    if (percentage >= 70) return { title: "Bible Scholar", verse: "Thy word is a lamp unto my feet, and a light unto my path. — Psalm 119:105" };
    if (percentage >= 50) return { title: "Rabbit", verse: "The righteous are as bold as a lion, but the wicked flee when no one pursues. — Proverbs 28:1" };
    return { title: "Seeker", verse: "Be of good courage, and he shall strengthen your heart. — Psalm 31:24" };
  };

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
              <button key={i+1} onClick={() => { setSelection({...selection, level: i+1}); startQuiz(); }} className="p-6 bg-[#151515] border border-slate-800 rounded-2xl hover:border-yellow-600">Level {i+1}</button>
            ))}
          </div>
        )}

        {quizState === 'playing' && questions[current] && (
          <div className="bg-[#0c0c0c] p-8 rounded-3xl border border-slate-800">
            <h2 className="text-xl font-bold mb-6">{questions[current].question}</h2>
            <div className="grid gap-3">
              {questions[current].options.map((opt, i) => {
                let btnStyle = "bg-[#151515] border-slate-800";
                if (answered) {
                  if (i === questions[current].answer) btnStyle = "bg-green-600/20 border-green-500";
                  else btnStyle = "bg-red-600/20 border-red-500 opacity-50";
                }
                return (
                  <button key={i} disabled={answered} onClick={() => { setAnswered(true); if(i === questions[current].answer) setScore(s => s + 1); }} className={`p-4 rounded-xl border text-left ${btnStyle}`}>
                    {opt}
                  </button>
                );
              })}
            </div>
            {answered && (
              <button className="mt-6 w-full bg-yellow-600 py-3 rounded-xl font-bold" onClick={() => { if(current + 1 < questions.length) { setCurrent(current + 1); setAnswered(false); } else { setQuizState('finished'); } }}>
                {current + 1 < questions.length ? 'Next Question' : 'Finish Quiz'}
              </button>
            )}
          </div>
        )}

        {quizState === 'finished' && (
          <div className="bg-[#0c0c0c] p-10 rounded-3xl text-center border border-slate-800">
            {(() => {
              const percentage = Math.round((score / questions.length) * 100);
              const res = getResults(percentage);
              return (
                <>
                  <h2 className="text-4xl font-black text-yellow-500 mb-2">{res.title}</h2>
                  <p className="text-2xl font-bold mb-4">{score} / {questions.length}</p>
                  <p className="text-slate-500 mb-6 italic">"{res.verse}"</p>
                  <input placeholder="Enter your name" className="w-full p-4 bg-[#151515] border border-slate-800 rounded-xl mb-4 text-white text-center" onChange={(e) => setName(e.target.value)} />
                  <button onClick={saveScore} disabled={saving} className="w-full bg-yellow-600 py-4 rounded-xl font-bold">{saving ? 'SAVING...' : 'SAVE SCORE'}</button>
                </>
              );
            })()}
          </div>
        )}
      </main>
    </div>
  );
}