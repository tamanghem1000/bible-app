import Head from 'next/head';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

const EMPTY_FORM = {
  question: '', image_url: '', options: ['', '', '', ''], answer: 0,
  category: 'General', difficulty: 'medium', scripture_reference: '',
  book: 'Genesis', chapter: 1
};

export default function AdminPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  async function saveQuestion(e) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, answer: Number(form.answer), chapter: Number(form.chapter) };
    
    await fetch('/api/questions', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload) 
    });

    setForm(EMPTY_FORM); setSaving(false); alert("Question Published!");
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200">
      <Navbar />
      <main className="max-w-4xl mx-auto p-6 md:p-12">
        <div className="mb-10 border-b border-slate-800 pb-6">
          <h1 className="text-4xl font-extrabold text-white">Content <span className="text-yellow-500">Studio</span></h1>
          <p className="text-slate-500 mt-2">Manage your quiz database with production-grade tools.</p>
        </div>
        
        <form onSubmit={saveQuestion} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form Side */}
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

          {/* Settings Side */}
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
              {saving ? 'PUBLISHING...' : 'PUBLISH TO DATABASE'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}