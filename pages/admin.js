import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

const EMPTY_FORM = {
  question: '', image_url: '', options: ['', '', '', ''], answer: 0,
  category: 'General', difficulty: 'medium', scripture_reference: '',
  book: 'Genesis', chapter: 1
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [questions, setQuestions] = useState([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('admin_auth') === 'true') {
      setIsAuthenticated(true);
    }
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    const res = await fetch('/api/questions');
    const data = await res.json();
    setQuestions(Array.isArray(data) ? data : []);
  }

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'Hem') { // Change this!
      localStorage.setItem('admin_auth', 'true');
      setIsAuthenticated(true);
    } else {
      alert('Invalid Password');
    }
  };

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="bg-[#0c0c0c] p-8 rounded-2xl border border-slate-800 w-full max-w-sm shadow-2xl">
          <h2 className="text-white text-xl font-bold mb-6 text-center">Studio Access</h2>
          <input 
            type="password" 
            className="w-full bg-[#151515] p-3 rounded-lg border border-slate-800 text-white mb-4 outline-none focus:border-yellow-600"
            placeholder="Enter password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-yellow-600 text-black py-3 rounded-lg font-bold hover:bg-yellow-500 transition">Login</button>
        </form>
      </div>
    );
  }

  // --- EXISTING ADMIN UI ---
  async function saveQuestion(e) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, answer: Number(form.answer), chapter: Number(form.chapter) };
    const url = editingId ? `/api/questions/${editingId}` : '/api/questions';
    const method = editingId ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setForm(EMPTY_FORM); setEditingId(null); setSaving(false); fetchQuestions();
  }

  async function deleteQuestion(id) {
    if (!confirm('Delete this?')) return;
    await fetch(`/api/questions/${id}`, { method: 'DELETE' });
    fetchQuestions();
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200">
      <Navbar />
      <main className="max-w-5xl mx-auto p-6 md:p-12 space-y-12">
        <section>
          <div className="mb-10 border-b border-slate-800 pb-6">
            <h1 className="text-4xl font-extrabold text-white">Content <span className="text-yellow-500">Studio</span></h1>
          </div>
          <form onSubmit={saveQuestion} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-[#0c0c0c] p-6 rounded-2xl border border-slate-800">
                <textarea className="w-full bg-transparent text-lg focus:outline-none h-32" value={form.question} onChange={e => setForm({...form, question: e.target.value})} placeholder="Ask something..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 {form.options.map((opt, i) => (
                  <div key={i} className="bg-[#0c0c0c] p-4 rounded-xl border border-slate-800"><input className="w-full bg-transparent outline-none text-sm" placeholder={`Opt ${i+1}`} value={opt} onChange={e => { let n = [...form.options]; n[i] = e.target.value; setForm({...form, options: n}); }} /></div>
                 ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-[#0c0c0c] p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input className="bg-[#151515] p-3 rounded-lg border border-slate-800 outline-none" placeholder="Book" value={form.book} onChange={e => setForm({...form, book: e.target.value})} />
                  <input type="number" className="bg-[#151515] p-3 rounded-lg border border-slate-800 outline-none text-center" value={form.chapter} onChange={e => setForm({...form, chapter: e.target.value})} />
                </div>
                <input className="w-full bg-[#151515] p-3 rounded-lg border border-slate-800 outline-none" placeholder="Reference" value={form.scripture_reference} onChange={e => setForm({...form, scripture_reference: e.target.value})} />
              </div>
              <button className="w-full bg-yellow-600 text-black py-4 rounded-2xl font-black">{saving ? 'SAVING...' : (editingId ? 'UPDATE' : 'PUBLISH')}</button>
            </div>
          </form>
        </section>

        <section className="bg-[#0c0c0c] p-8 rounded-3xl border border-slate-800">
          <input className="bg-[#151515] p-3 rounded-xl border border-slate-800 w-full mb-6" placeholder="Filter..." value={filter} onChange={(e) => setFilter(e.target.value)} />
          <div className="space-y-4">
            {questions.filter(q => q.book.toLowerCase().includes(filter.toLowerCase())).map(q => (
              <div key={q.id} className="flex justify-between items-center p-4 bg-[#151515] rounded-xl border border-slate-800">
                <p className="text-sm">{q.question}</p>
                <div className="flex gap-2">
                  <button onClick={() => {setEditingId(q.id); setForm(q);}} className="text-blue-400">Edit</button>
                  <button onClick={() => deleteQuestion(q.id)} className="text-red-500">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}