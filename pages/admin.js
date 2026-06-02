import Head from 'next/head';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

const EMPTY_FORM = {
  question: '',
  image: '',
  options: ['', '', '', ''],
  answer: 0,
  category: 'General',
  difficulty: 'medium',
  reference: '',
  book: 'Genesis',
  chapter: 1
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { if (isAuthenticated) fetchQuestions(); }, [isAuthenticated]);

  async function fetchQuestions() {
    setLoading(true);
    const res = await fetch('/api/questions');
    const data = await res.json();
    setQuestions(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  function flash(m, type = 'success') {
    setMsg({ text: m, type });
    setTimeout(() => setMsg(''), 3000);
  }

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === 'Hem') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Incorrect password.');
    }
  };

  async function saveQuestion(e) {
    e.preventDefault();
    setSaving(true);
    const payload = { 
      ...form, 
      options: form.options.filter(o => o.trim()), 
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

    flash(editing ? 'Question updated!' : 'Question added!');
    setForm(EMPTY_FORM);
    setEditing(null);
    setSaving(false);
    fetchQuestions();
  }

  async function deleteQuestion(id) {
    await fetch(`/api/questions/${id}`, { method: 'DELETE' });
    flash('Question deleted.');
    setDeleteConfirm(null);
    fetchQuestions();
  }

  function editQuestion(q) {
    setEditing(q.id);
    setForm({ 
      question: q.question, 
      image: q.image_url || '', 
      options: [...(q.options || []), '', '', '', ''].slice(0, 4), 
      answer: q.answer, 
      category: q.category || 'General', 
      difficulty: q.difficulty || 'medium', 
      reference: q.scripture_reference || '',
      book: q.book || 'Genesis',
      chapter: q.chapter || 1
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const inputStyle = { width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.25)', color: '#f5f0e8', borderRadius: 4, outline: 'none' };
  const labelStyle = { display: 'block', fontSize: '0.75rem', color: '#c9a84c', marginBottom: 6, textTransform: 'uppercase' };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0d1b3e' }}>
        <form onSubmit={handleLogin} style={{ padding: 40, background: 'rgba(255,255,255,0.03)', border: '1px solid #c9a84c', borderRadius: 8, width: 340 }}>
          <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} style={inputStyle} placeholder="Password" />
          <button type="submit" style={{ width: '100%', padding: 12, background: '#c9a84c', border: 'none', cursor: 'pointer' }}>LOGIN</button>
          {loginError && <p style={{ color: '#e05252' }}>{loginError}</p>}
        </form>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 800, margin: '20px auto', padding: 20 }}>
        <h1>{editing ? 'Edit' : 'Add'} Question</h1>
        <form onSubmit={saveQuestion}>
          <label style={labelStyle}>Question</label>
          <textarea value={form.question} onChange={e => setForm({...form, question: e.target.value})} style={inputStyle} rows={3} required />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '16px 0' }}>
            <div>
              <label style={labelStyle}>Book</label>
              <input value={form.book} onChange={e => setForm({...form, book: e.target.value})} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Chapter</label>
              <input type="number" value={form.chapter} onChange={e => setForm({...form, chapter: e.target.value})} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={inputStyle}>
              {['Old Testament', 'New Testament', 'General'].map(c => <option key={c} value={c} style={{color: '#000'}}>{c}</option>)}
            </select>
            <select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})} style={inputStyle}>
              {['easy', 'medium', 'hard'].map(d => <option key={d} value={d} style={{color: '#000'}}>{d}</option>)}
            </select>
          </div>

          <label style={labelStyle}>Options</label>
          {form.options.map((opt, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
              <input type="radio" checked={form.answer === i} onChange={() => setForm({...form, answer: i})} />
              <input value={opt} onChange={e => {
                const o = [...form.options]; o[i] = e.target.value;
                setForm({...form, options: o});
              }} style={inputStyle} placeholder={`Option ${i+1}`} />
            </div>
          ))}

          <button type="submit" disabled={saving} style={{ width: '100%', padding: 15, background: '#c9a84c', border: 'none', marginTop: 10 }}>
            {saving ? 'SAVING...' : editing ? 'UPDATE' : 'ADD'}
          </button>
        </form>

        {loading ? <p>Loading...</p> : (
          questions.map(q => (
            <div key={q.id} style={{ border: '1px solid #444', padding: 15, marginTop: 15 }}>
              <p>{q.question} ({q.book} {q.chapter})</p>
              <button onClick={() => editQuestion(q)}>Edit</button>
              <button onClick={() => setDeleteConfirm(q.id)}>Delete</button>
            </div>
          ))
        )}
      </main>
    </>
  );
}