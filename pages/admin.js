import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

const BOOKS = {
  "Old Testament": ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"],
  "New Testament": ["Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"],
  "General": ["General"]
};

const EMPTY_FORM = {
  question: '', options: ['', '', '', ''], answer: 0,
  category: 'General', difficulty: 1, scripture_reference: '',
  book: 'General', chapter: 1
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [questions, setQuestions] = useState([]);
  const [scores, setScores] = useState([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('admin_auth') === 'true') {
      setIsAuthenticated(true);
      fetchQuestions();
      fetchScores();
    }
  }, []);

  async function fetchQuestions() {
    const res = await fetch('/api/questions');
    const data = await res.json();
    setQuestions(Array.isArray(data) ? data : []);
  }

  async function fetchScores() {
    const res = await fetch('/api/leaderboard');
    const data = await res.json();
    setScores(Array.isArray(data) ? data : []);
  }

  async function saveQuestion(e) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, answer: Number(form.answer), difficulty: Number(form.difficulty), chapter: Number(form.chapter) };
    const url = editingId ? `/api/questions/${editingId}` : '/api/questions';
    const method = editingId ? 'PUT' : 'POST';
    
    const res = await fetch(url, { 
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) 
    });

    if (res.ok) {
      alert("Question saved successfully!");
      setForm(EMPTY_FORM); setEditingId(null); fetchQuestions();
    } else {
      alert("Error saving question");
    }
    setSaving(false);
  }

  async function deleteQuestion(id) {
    if (!confirm('Delete this question?')) return;
    await fetch(`/api/questions/${id}`, { method: 'DELETE' });
    fetchQuestions();
  }

  async function deleteScore(id) {
    if (!confirm('Delete this user score?')) return;
    try {
      const res = await fetch('/api/delete-leaderboard', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': 'HemBible' },
        body: JSON.stringify({ id })
      });
      const result = await res.json();
      if (res.ok) { alert("Score deleted successfully!"); fetchScores(); }
      else { alert(`Error: ${result.error || 'Unauthorized'}`); }
    } catch (err) { alert("Failed to connect to the server."); }
  }

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <form onSubmit={(e) => { e.preventDefault(); if(password === 'HemBible') { localStorage.setItem('admin_auth','true'); setIsAuthenticated(true); fetchQuestions(); fetchScores(); } }} className="bg-[#0c0c0c] p-8 rounded-2xl border border-slate-800 w-full max-w-sm">
        <input type="password" placeholder="Password" className="w-full bg-[#151515] p-3 rounded-lg text-white mb-4" onChange={e => setPassword(e.target.value)} />
        <button className="w-full bg-yellow-600 py-3 rounded-lg font-bold">Login</button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200">
      <Navbar />
      <main className="max-w-4xl mx-auto p-6 space-y-8">
        <form onSubmit={saveQuestion} className="bg-[#0c0c0c] p-8 rounded-3xl border border-slate-800 space-y-6">
          <h2 className="text-xl font-bold">{editingId ? 'Edit Question' : 'Add New Question'}</h2>
          <textarea className="w-full bg-[#151515] p-4 rounded-xl border border-slate-800" placeholder="Question" value={form.question} onChange={e => setForm({...form, question: e.target.value})} />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select className="bg-[#151515] p-3 rounded-xl border border-slate-800 w-full" value={form.category} onChange={e => setForm({...form, category: e.target.value, book: BOOKS[e.target.value][0]})}>
              {Object.keys(BOOKS).map(cat => <option key={cat}>{cat}</option>)}
            </select>
            <select className="bg-[#151515] p-3 rounded-xl border border-slate-800 w-full" value={form.book} onChange={e => setForm({...form, book: e.target.value})}>
              {BOOKS[form.category].map(b => <option key={b}>{b}</option>)}
            </select>
            <select className="bg-[#151515] p-3 rounded-xl border border-slate-800 w-full" value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}>
              {[...Array(10)].map((_, i) => <option key={i+1} value={i+1}>Level {i+1}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {form.options.map((opt, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${form.answer === i ? 'bg-yellow-600/20 border-yellow-600' : 'bg-[#151515] border-slate-800'}`}>
                <input type="radio" name="correctAnswer" checked={form.answer === i} onChange={() => setForm({...form, answer: i})} className="cursor-pointer" />
                <input className="w-full bg-transparent outline-none" placeholder={`Option ${i+1}`} value={opt} onChange={e => { let n = [...form.options]; n[i] = e.target.value; setForm({...form, options: n}); }} />
              </div>
            ))}
          </div>
          <button className="w-full bg-yellow-600 py-4 rounded-xl font-black">{saving ? 'SAVING...' : (editingId ? 'UPDATE' : 'PUBLISH')}</button>
        </form>

        <section className="bg-[#0c0c0c] p-8 rounded-3xl border border-slate-800">
          <input className="bg-[#151515] p-3 rounded-xl border border-slate-800 w-full mb-6" placeholder="Filter questions..." value={filter} onChange={(e) => setFilter(e.target.value)} />
          {questions.filter(q => q.book.toLowerCase().includes(filter.toLowerCase())).map(q => (
            <div key={q.id} className="flex justify-between items-center p-4 bg-[#151515] rounded-xl border border-slate-800 mb-4">
              <p className="text-sm truncate mr-4">{q.question}</p>
              <div className="flex gap-2">
                <button onClick={() => { setEditingId(q.id); setForm(q); window.scrollTo(0,0); }} className="text-blue-400">Edit</button>
                <button onClick={() => deleteQuestion(q.id)} className="text-red-500">Delete</button>
              </div>
            </div>
          ))}
        </section>

        <section className="bg-[#0c0c0c] p-8 rounded-3xl border border-slate-800">
          <h2 className="text-xl font-bold mb-6">Manage Leaderboard</h2>
          {scores.map(s => (
            <div key={s.id} className="flex justify-between items-center p-4 bg-[#151515] rounded-xl border border-slate-800 mb-4">
              <div><p className="font-bold">{s.name}</p><p className="text-xs text-slate-500">{s.score} PTS</p></div>
              <button onClick={() => deleteScore(s.id)} className="text-red-500 text-sm">Delete</button>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}