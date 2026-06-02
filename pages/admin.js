import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

const EMPTY_FORM = {
  question: '', image_url: '', options: ['', '', '', ''], answer: 0,
  category: 'General', difficulty: 'medium', scripture_reference: '',
  book: 'Genesis', chapter: 1
};

export default function AdminPage() {
  const [questions, setQuestions] = useState([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null); // Tracks if we are editing
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchQuestions(); }, []);

  async function fetchQuestions() {
    const res = await fetch('/api/questions');
    const data = await res.json();
    setQuestions(Array.isArray(data) ? data : []);
  }

  // --- NEW: Edit Setup ---
  function editQuestion(q) {
    setEditingId(q.id);
    setForm({
      question: q.question,
      options: q.options,
      answer: q.answer,
      category: q.category,
      difficulty: q.difficulty,
      scripture_reference: q.scripture_reference,
      book: q.book,
      chapter: q.chapter
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function saveQuestion(e) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, answer: Number(form.answer), chapter: Number(form.chapter) };
    
    // Use PUT if editingId exists, otherwise POST
    const url = editingId ? `/api/questions/${editingId}` : '/api/questions';
    const method = editingId ? 'PUT' : 'POST';
    
    await fetch(url, { 
      method, 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload) 
    });

    setForm(EMPTY_FORM); 
    setEditingId(null); 
    setSaving(false); 
    alert(editingId ? "Updated!" : "Published!");
    fetchQuestions();
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
        
        {/* PUBLISH / EDIT SECTION */}
        <section>
          <div className="mb-10 border-b border-slate-800 pb-6">
            <h1 className="text-4xl font-extrabold text-white">
              {editingId ? 'Edit ' : 'Content '} 
              <span className="text-yellow-500">{editingId ? 'Question' : 'Studio'}</span>
            </h1>
          </div>
          
          <form onSubmit={saveQuestion} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-[#0c0c0c] p-6 rounded-2xl border border-slate-800">
                <label className="text-[10px] font-black uppercase text-yellow-600 tracking-widest mb-2 block">The Question</label>
                <textarea className="w-full bg-transparent text-lg focus:outline-none h-32 placeholder:text-slate-700"
                  value={form.question} onChange={e => setForm({...form, question: e.target.value})} placeholder="Ask something meaningful..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 {form.options.map((opt, i) => (
                  <div key={i} className="bg-[#0c0c0c] p-4 rounded-xl border border-slate-800 focus-within:border-yellow-600 transition-all">
                    <input className="w-full bg-transparent outline-none text-sm" placeholder={`Option ${i+1}`} value={opt} 
                      onChange={e => { let n = [...form.options]; n[i] = e.target.value; setForm({...form, options: n}); }} />
                  </div>
                 ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-[#0c0c0c] p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input className="bg-[#151515] p-3 rounded-lg border border-slate-800 outline-none" placeholder="Book" value={form.book} onChange={e => setForm({...form, book: e.target.value})} />
                  <input type="number" className="bg-[#151515] p-3 rounded-lg border border-slate-800 outline-none text-center" value={form.chapter} onChange={e => setForm({...form, chapter: e.target.value})} />
                </div>
                <input className="w-full bg-[#151515] p-3 rounded-lg border border-slate-800 outline-none" placeholder="Scripture Reference (e.g. John 3:16)" value={form.scripture_reference} onChange={e => setForm({...form, scripture_reference: e.target.value})} />
                <select className="w-full bg-[#151515] p-3 rounded-lg border border-slate-800 outline-none" value={form.answer} onChange={e => setForm({...form, answer: e.target.value})}>
                  {[0,1,2,3].map(n => <option key={n} value={n}>Correct Option: {n+1}</option>)}
                </select>
              </div>

              <button type="submit" className="w-full bg-yellow-600 text-black py-4 rounded-2xl font-black hover:bg-yellow-500 transition-transform active:scale-95 shadow-[0_0_20px_rgba(202,138,4,0.3)]">
                {saving ? 'SAVING...' : (editingId ? 'UPDATE QUESTION' : 'PUBLISH TO DATABASE')}
              </button>
            </div>
          </form>
        </section>

        {/* MANAGEMENT SECTION */}
        <section className="bg-[#0c0c0c] p-8 rounded-3xl border border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Existing Questions</h2>
            <input 
              className="bg-[#151515] p-3 rounded-xl border border-slate-800 outline-none w-64 text-sm"
              placeholder="Filter by Book..."
              value={filter} onChange={(e) => setFilter(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {questions.filter(q => q.book.toLowerCase().includes(filter.toLowerCase())).map(q => (
              <div key={q.id} className="flex justify-between items-center p-4 bg-[#151515] rounded-xl border border-slate-800 hover:border-slate-600 transition">
                <div>
                  <p className="font-bold text-white text-sm">{q.question}</p>
                  <p className="text-[10px] text-slate-500 uppercase">{q.book} • Chapter {q.chapter}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editQuestion(q)} className="text-blue-400 text-xs px-3 py-1 hover:underline">Edit</button>
                  <button onClick={() => deleteQuestion(q.id)} className="text-red-500 text-xs px-3 py-1 hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}