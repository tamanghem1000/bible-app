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
  book: 'Genesis', // Added
  chapter: 1       // Added
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

  useEffect(() => { 
    if (isAuthenticated) fetchQuestions(); 
  }, [isAuthenticated]);

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
      setLoginError('Incorrect password. Access denied.');
    }
  };

  async function saveQuestion(e) {
    e.preventDefault();
    const filledOptions = form.options.filter(o => o.trim());
    if (!form.question.trim() || filledOptions.length < 2) {
      return flash('Question and at least 2 options are required.', 'error');
    }
    setSaving(true);
    
    const payload = { 
      ...form, 
      options: form.options.filter(o => o.trim()), 
      answer: Number(form.answer),
      chapter: Number(form.chapter) // Ensure number
    };

    if (editing) {
      await fetch(`/api/questions/${editing}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      flash('Question updated!');
      setEditing(null);
    } else {
      await fetch('/api/questions', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      flash('Question added!');
    }
    setForm(EMPTY_FORM);
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
      image: q.image_url || q.image || '', 
      options: [...(q.options || []), '', '', '', ''].slice(0, 4), 
      answer: q.answer, 
      category: q.category || 'General', 
      difficulty: q.difficulty || 'medium', 
      reference: q.scripture_reference || q.reference || '',
      book: q.book || 'Genesis',
      chapter: q.chapter || 1
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const inputStyle = { width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.25)', color: '#f5f0e8', borderRadius: 4, fontSize: '0.9rem', outline: 'none', fontFamily: 'Lato, sans-serif' };
  const labelStyle = { display: 'block', fontSize: '0.75rem', color: 'rgba(201,168,76,0.7)', marginBottom: 6, fontFamily: 'Cinzel, serif', letterSpacing: '0.07em' };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0d1b3e' }}>
        <form onSubmit={handleLogin} style={{ padding: '40px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '8px', width: '340px', textAlign: 'center' }}>
          <h2 style={{ color: '#c9a84c', fontFamily: 'Cinzel, serif' }}>Admin Gate</h2>
          <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '18px', backgroundColor: '#12224c', color: '#fff' }} />
          <button type="submit" style={{ width: '100%', padding: '12px', background: '#c9a84c', border: 'none', cursor: 'pointer' }}>AUTHENTICATE</button>
          {loginError && <p style={{ color: '#e05252', marginTop: '18px' }}>{loginError}</p>}
        </form>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '40px 20px' }}>
        <h1>{editing ? 'Edit Question' : 'Add New Question'}</h1>
        
        <form onSubmit={saveQuestion}>
          <div className="card" style={{ padding: 28 }}>
            {/* ... Existing inputs for Question, Image, Options ... */}
            <textarea value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} placeholder="Enter question..." style={inputStyle} required />
            
            {/* NEW FIELDS ADDED HERE */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
              <div>
                <label style={labelStyle}>BOOK</label>
                <input type="text" value={form.book} onChange={e => setForm(f => ({...f, book: e.target.value}))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>CHAPTER</label>
                <input type="number" value={form.chapter} onChange={e => setForm(f => ({...f, chapter: parseInt(e.target.value) || 1}))} style={inputStyle} />
              </div>
            </div>

            {/* ... Rest of your category/difficulty selects and buttons ... */}
            <button type="submit" className="btn-gold" disabled={saving}>
              {saving ? 'SAVING...' : editing ? 'UPDATE QUESTION' : 'ADD QUESTION'}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}