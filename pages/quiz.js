import { useState } from 'react';
import Navbar from '../components/Navbar';

export default function QuizPage() {
  const [quizState, setQuizState] = useState('category'); // category, book, level, playing, finished
  const [selection, setSelection] = useState({ category: '', book: '', level: '' });
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [name, setName] = useState('');

  const books = {
    "Old Testament": ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"],
    "New Testament": ["Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"]
  };

  async function startQuiz() {
    const bookParam = selection.category === 'General' ? '' : selection.book;
    const res = await fetch(`/api/questions?book=${bookParam}&difficulty=${selection.level}`);
    const data = await res.json();
    if (data.length === 0) return alert("No questions found!");
    setQuestions(data.sort(() => Math.random() - 0.5));
    setQuizState('playing');
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200">
      <Navbar />
      <main className="max-w-2xl mx-auto p-6">
        
        {/* CATEGORY SELECT */}
        {quizState === 'category' && (
          <div className="grid gap-4">
            <h1 className="text-2xl font-bold mb-4">Select Category</h1>
            {['Old Testament', 'New Testament', 'General'].map(cat => (
              <button key={cat} onClick={() => { setSelection({...selection, category: cat}); setQuizState(cat === 'General' ? 'level' : 'book'); }} className="p-6 bg-[#151515] border border-slate-800 rounded-2xl hover:border-yellow-600">{cat}</button>
            ))}
          </div>
        )}

        {/* BOOK SELECT */}
        {quizState === 'book' && (
          <div className="grid grid-cols-2 gap-2 h-96 overflow-y-auto">
            {books[selection.category].map(b => (
              <button key={b} onClick={() => { setSelection({...selection, book: b}); setQuizState('level'); }} className="p-3 bg-[#151515] border border-slate-800 rounded-lg text-xs">{b}</button>
            ))}
          </div>
        )}

        {/* LEVEL SELECT */}
        {quizState === 'level' && (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(10)].map((_, i) => (
              <button key={i+1} onClick={() => { setSelection({...selection, level: i+1}); startQuiz(); }} className="p-6 bg-[#151515] border border-slate-800 rounded-2xl">Level {i+1}</button>
            ))}
          </div>
        )}

        {/* PLAYING/FINISHED SCREENS */}
        {/* ... (Keep your existing playing and finished code here) ... */}
      </main>
    </div>
  );
}