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
    
    // Clean payload to match database exactly
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
    <>
      <Navbar />
      <main style={{ maxWidth: 800, margin: '20px auto', padding: 20, backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <h1>{editing ? 'Edit' : 'Add'} Question</h1>
        <form onSubmit={saveQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <label>Question</label>
          <textarea value={form.question} onChange={e => setForm({...form, question: e.target.value})} required style={{width: '100%', padding: '8px'}} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <input value={form.book} onChange={e => setForm({...form, book: e.target.value})} placeholder="Book (e.g. Genesis)" />
            <input type="number" value={form.chapter} onChange={e => setForm({...form, chapter: e.target.value})} placeholder="Chapter" />
          </div>

          <label>Options (4)</label>
          {form.options.map((opt, i) => (
            <input key={i} value={opt} onChange={e => {
              const newOpts = [...form.options];
              newOpts[i] = e.target.value;
              setForm({...form, options: newOpts});
            }} placeholder={`Option ${i + 1}`} />
          ))}

          <label>Correct Answer Index (0-3)</label>
          <input type="number" value={form.answer} onChange={e => setForm({...form, answer: e.target.value})} />

          <label>Scripture Reference</label>
          <input value={form.scripture_reference} onChange={e => setForm({...form, scripture_reference: e.target.value})} placeholder="e.g. John 3:16" />

          <select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <button type="submit" style={{ padding: '10px', background: 'blue', color: 'white' }}>
            {saving ? 'SAVING...' : 'SAVE QUESTION'}
          </button>
        </form>
      </main>
    </>
  );
}