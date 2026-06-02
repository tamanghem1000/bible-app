import Head from 'next/head';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

const EMPTY_FORM = {
  question: '', image: '', options: ['', '', '', ''], answer: 0,
  category: 'General', difficulty: 'medium', reference: '',
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
      options: form.options.filter(o => o.trim()), 
      answer: Number(form.answer),
      chapter: Number(form.chapter),
      scripture_reference: form.reference // Ensure this matches DB column
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
      <main style={{ maxWidth: 800, margin: '20px auto', padding: 20 }}>
        <h1>{editing ? 'Edit' : 'Add'} Question</h1>
        <form onSubmit={saveQuestion}>
          <label>Question</label>
          <textarea value={form.question} onChange={e => setForm({...form, question: e.target.value})} required style={{width: '100%'}} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <input value={form.book} onChange={e => setForm({...form, book: e.target.value})} placeholder="Book" />
            <input type="number" value={form.chapter} onChange={e => setForm({...form, chapter: e.target.value})} placeholder="Chapter" />
          </div>

          <label>Scripture Reference</label>
          <input value={form.reference} onChange={e => setForm({...form, reference: e.target.value})} placeholder="e.g. John 3:16" style={{width: '100%'}} />

          <select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <button type="submit">{saving ? 'SAVING...' : 'SAVE QUESTION'}</button>
        </form>
      </main>
    </>
  );
}