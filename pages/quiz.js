import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

export default function QuizPage() {
  const [quizState, setQuizState] = useState('category');
  const [selection, setSelection] = useState({ category: '', book: '', level: '' });
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [unlockedLevels, setUnlockedLevels] = useState([1]);

  useEffect(() => {
    const saved = localStorage.getItem('unlockedLevels');
    if (saved) setUnlockedLevels(JSON.parse(saved));
  }, []);

  const unlockNextLevel = (completedLevel) => {
    if (score >= 7 && !unlockedLevels.includes(completedLevel + 1)) {
      const newLevels = [...unlockedLevels, completedLevel + 1];
      setUnlockedLevels(newLevels);
      localStorage.setItem('unlockedLevels', JSON.stringify(newLevels));
    }
  };

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
    setSelectedOption(index);
    const isCorrect = index === questions[current].answer;
    if (isCorrect) setScore(s => s + 1);
    setAttempts([...attempts, { question: questions[current].question, options: questions[current].options, selected: index, correct: questions[current].answer }]);
  }

  async function saveScore() {
    if (!name.trim()) return alert("Enter name!");
    setSaving(true);
    unlockNextLevel(selection.level);
    try {
      const res = await fetch('/api/leaderboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim(), score: score, total: questions.length }) });
      if (res.ok) { window.location.href = '/leaderboard'; }
      else { throw new Error("Failed"); }
    } catch (err) { alert(err.message); setSaving(false); }
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
          <div className="grid gap-4">
            <div className="bg-yellow-600/10 border border-yellow-600/50 p-4 rounded-xl text-yellow-500 text-sm text-center">
              Score at least 7 correct answers to unlock the next level!
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(10)].map((_, i) => {
                const level = i + 1;
                const isLocked = !unlockedLevels.includes(level);
                return (
                  <button key={level} disabled={isLocked} onClick={() => { setSelection({...selection, level: level}); startQuiz(level, selection.book || 'General'); }} className={`p-6 border rounded-2xl ${isLocked ? 'bg-slate-900 border-slate-800 opacity-50 cursor-not-allowed' : 'bg-[#151515] border-slate-800 hover:border-yellow-600'}`}>
                    {isLocked ? `🔒 Level ${level}` : `Level ${level}`}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {quizState === 'playing' && (
          <div className="bg-[#0c0c0c] p-8 rounded-3xl border border-slate-800">
            <div className="flex justify-between text-xs text-slate-500 mb-4 uppercase tracking-widest">
              <span>Question {current + 1} of {questions.length}</span>
              <span>Level {selection.level}</span>
            </div>
            <h2 className="text-xl font-bold mb-6">{questions[current].question}</h2>
            <div className="grid gap-3">
              {questions[current].options.map((opt, i) => {
                let color = "bg-[#151515] border-slate-800";
                if (answered) {
                  if (i === questions[current].answer) color = "bg-green-600/20 border-green-500";
                  else if (i === selectedOption) color = "bg-red-600/20 border-red-500";
                }
                return (
                  <button key={i} disabled={answered} onClick={() => handleAnswer(i)} className={`p-4 rounded-xl border text-left ${color}`}>{opt}</button>
                );
              })}
            </div>
            {answered && (
              <div className="mt-6 p-4 rounded-xl bg-[#151515] border border-slate-800 text-center">
                <button className="w-full bg-yellow-600 py-3 rounded-xl font-bold" onClick={() => { if(current + 1 < questions.length) { setCurrent(current + 1); setAnswered(false); setSelectedOption(null); } else { setQuizState('finished'); } }}>
                  {current + 1 < questions.length ? 'Next Question' : 'Finish Quiz'}
                </button>
              </div>
            )}
          </div>
        )}
        {quizState === 'finished' && (
          <div className="space-y-6">
            <div className="bg-[#0c0c0c] p-10 rounded-3xl text-center border border-slate-800">
              {(() => {
                const percentage = Math.round((score / questions.length) * 100);
                const res = getResults(percentage);
                return (
                  <>
                    <h2 className="text-3xl font-black text-yellow-500 mb-6">{res.title}</h2>
                    <p className="text-xl font-bold mb-6">You scored {score} / {questions.length}</p>
                    <input className="w-full p-4 bg-[#151515] border border-slate-800 rounded-xl mb-4 text-white text-center" placeholder="Enter name" onChange={(e) => setName(e.target.value)} />
                    <button onClick={saveScore} className="w-full bg-yellow-600 py-4 rounded-xl font-bold mb-4">SAVE SCORE</button>
                    {score >= 7 && selection.level < 10 && (
                      <button onClick={() => { setSelection({...selection, level: selection.level + 1}); startQuiz(selection.level + 1, selection.book || 'General'); }} className="w-full bg-green-600 py-4 rounded-xl font-bold">PROCEED TO LEVEL {selection.level + 1}</button>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}