import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

const EMPTY_FORM = {
  question: '', options: ['', '', '', ''], answer: 0,
  category: 'General', difficulty: 1, scripture_reference: '',
  book: 'Genesis', chapter: 1
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('admin_auth') === 'true') setIsAuthenticated(true);
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    const res = await fetch('/api/questions');
    const data = await res.json();
    setQuestions(Array.isArray(data) ? data : []);
  }

  async function saveQuestion(e) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, answer: Number(form.answer), difficulty: Number(form.difficulty), chapter: Number(form.chapter) };
    const url = editingId ? `/api/questions/${editingId}` : '/api/questions';
    const method = editingId ? 'PUT' : 'POST';
    
    const res = await fetch(url, { 
      method, 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload) 
    });

    if (res.ok) {
      alert("Question saved successfully!");
      setForm(EMPTY_FORM); setEditingId(null); fetchQuestions();
    } else {
      alert("Error saving question");
    }
    setSaving(false);
  }

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <form onSubmit={(e) => { e.preventDefault(); if(password === 'Hem') { localStorage.setItem('admin_auth','true'); setIsAuthenticated(true); } }} className="bg-[#0c0c0c] p-8 rounded-2xl border border-slate-800 w-full max-w-sm">
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
          <textarea className="w-full bg-[#151515] p-4 rounded-xl border border-slate-800" placeholder="Question" value={form.question} onChange={e => setForm({...form, question: e.target.value})} />
          
          <p className="text-sm text-slate-400 font-bold">Select the Correct Option:</p>
          <div className="grid grid-cols-2 gap-4">
            {form.options.map((opt, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${form.answer === i ? 'bg-yellow-600/20 border-yellow-600' : 'bg-[#151515] border-slate-800'}`}>
                <input type="radio" name="correctAnswer" checked={form.answer === i} onChange={() => setForm({...form, answer: i})} className="cursor-pointer" />
                <input className="w-full bg-transparent outline-none" placeholder={`Option ${i+1}`} value={opt} onChange={e => { let n = [...form.options]; n[i] = e.target.value; setForm({...form, options: n}); }} />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <input placeholder="Book" className="bg-[#151515] p-3 rounded-lg border border-slate-800" value={form.book} onChange={e => setForm({...form, book: e.target.value})} />
            <input type="number" placeholder="Level (1-10)" className="bg-[#151515] p-3 rounded-lg border border-slate-800" value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})} />
            <select className="bg-[#151515] p-3 rounded-lg border border-slate-800" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              <option>General</option><option>Old Testament</option><option>New Testament</option>
            </select>
          </div>
          <button className="w-full bg-yellow-600 py-4 rounded-xl font-black">{saving ? 'SAVING...' : (editingId ? 'UPDATE' : 'PUBLISH')}</button>
        </form>
      </main>
    </div>
  );
}