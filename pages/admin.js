import Head from 'next/head';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

const EMPTY_FORM = {
  question: '', image_url: '', options: ['', '', '', ''], answer: 0,
  category: 'General', difficulty: 'medium', scripture_reference: '',
  book: 'Genesis', chapter: 1
};

export default function AdminPage() {
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchQuestions(); }, []);

  async function fetchQuestions() {
    const res = await fetch('/api/questions');
    const data = await res.json();
    setQuestions(Array.isArray(data) ? data : []);
  }

  async function saveQuestion(e) {
    e.preventDefault();
    setSaving(true);
    
    const payload = { 
      ...form, 
      answer: Number(form.answer),
      chapter: Number(form.chapter)
    };

    const url = editing ? `/api/questions/${editing}` : '/api/questions';
    const method = editing ? 'PUT' : 'POST';
    
    await fetch(url, { 
      method, 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload) 
    });

    setForm(EMPTY_FORM); setEditing(null); setSaving(false); fetchQuestions();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="max-w-3xl mx-auto p-6 md:p-12">
        <h1 className="text-3xl font-bold mb-8 text-yellow-500">
          {editing ? 'Edit Question' : 'Add New Question'}
        </h1>
        
        <form onSubmit={saveQuestion} className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Question</label>
            <textarea 
              className="w-full p-4 bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-yellow-500 text-white"
              value={form.question} onChange={e => setForm({...form, question: e.target.value})} required rows="3" 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Book</label>
              <input className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white" 
                value={form.book} onChange={e => setForm({...form, book: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Chapter</label>
              <input type="number" className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white" 
                value={form.chapter} onChange={e => setForm({...form, chapter: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Options (Enter 4)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {form.options.map((opt, i) => (
                <input key={i} className="p-3 bg-slate-950 border border-slate-700 rounded-xl text-white" 
                  placeholder={`Option ${i + 1}`} value={opt} onChange={e => {
                    const newOpts = [...form.options];
                    newOpts[i] = e.target.value;
                    setForm({...form, options: newOpts});
                  }} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Correct Answer (Index 0-3)</label>
              <input type="number" className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white" 
                value={form.answer} onChange={e => setForm({...form, answer: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Difficulty</label>
              <select className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white" 
                value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-bold rounded-xl transition-all shadow-lg hover:shadow-yellow-900/50">
            {saving ? 'SAVING...' : 'SAVE QUESTION'}
          </button>
        </form>
      </main>
    </div>
  );
}