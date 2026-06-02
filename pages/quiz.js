import { useState } from 'react';
import Navbar from '../components/Navbar';

export default function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [quizState, setQuizState] = useState('category');
  const [selection, setSelection] = useState({ category: '', book: '', level: '' });
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [saving, setSaving] = useState(false);
  // ADDED: Name state
  const [name, setName] = useState('');

  const books = {
    "Old Testament": ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"],
    "New Testament": ["Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"]
  };

  const getResults = (percentage) => {
    if (percentage >= 90) return { title: "Scripture Master", verse: "His lord said unto him, Well done, good and faithful servant. — Matthew 25:21" };
    if (percentage >= 70) return { title: "Bible Scholar", verse: "Thy word is a lamp unto my feet, and a light unto my path. — Psalm 119:105" };
    if (percentage >= 50) return { title: "Faithful Student", verse: "The entrance of thy words giveth light. — Psalm 119:130" };
    return { title: "Seeker", verse: "Be of good courage, and he shall strengthen your heart. — Psalm 31:24" };
  };

  async function startQuiz() {
    const bookParam = selection.category === 'General' ? '' : selection.book;
    const res = await fetch(`/api/questions?book=${bookParam}&difficulty=${selection.level}`);
    const data = await res.json();
    if (data.length === 0) return alert("No questions found!");
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
    if (res.ok) window.location.href = '/leaderboard';
    else alert("Error saving score");
    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200">
      <Navbar />
      <main className="max-w-2xl mx-auto p-6 md:p-12">
        
        {/* SETUP SCREEN */}
        {['category', 'book', 'level'].includes(quizState) && (
          <div className="bg-[#0c0c0c] p-10 rounded-3xl border border-slate-800">
             {/* ... [Keep your existing Setup UI here] ... */}
             <h1 className="text-3xl font-black text-white mb-6">Select {quizState}</h1>
             {/* [Existing mapping logic for category/book/level remains identical] */}
             {/* (ensure you keep the logic that sets selection and quizState) */}
          </div>
        )}

        {/* RESULTS SCREEN */}
        {quizState === 'finished' && (
          <div className="bg-[#0c0c0c] p-10 rounded-3xl text-center border border-slate-800">
            {(() => {
              const res = getResults(Math.round((score / questions.length) * 100));
              return (
                <>
                  <h2 className="text-4xl font-black text-yellow-500 mb-2">{res.title}</h2>
                  <p className="text-slate-500 mb-6 italic">"{res.verse}"</p>
                  
                  {/* ADDED: Input field for name */}
                  <input 
                    placeholder="Enter your name" 
                    className="w-full p-4 bg-[#151515] border border-slate-800 rounded-xl mb-4 text-white text-center"
                    onChange={(e) => setName(e.target.value)}
                  />
                  
                  <button onClick={saveScore} disabled={saving} className="w-full bg-yellow-600 py-4 rounded-xl font-bold">
                    {saving ? 'SAVING...' : 'SAVE SCORE TO LEADERBOARD'}
                  </button>
                </>
              );
            })()}
          </div>
        )}
      </main>
    </div>
  );
}