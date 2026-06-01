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
};

export default function AdminPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => { fetchQuestions(); }, []);

  async function fetchQuestions() {
    setLoading(true);
    const res = await fetch('/api/questions');
    setQuestions(await res.json());
    setLoading(false);
  }

  function flash(m, type = 'success') {
    setMsg({ text: m, type });
    setTimeout(() => setMsg(''), 3000);
  }

  async function saveQuestion(e) {
    e.preventDefault();
    const filledOptions = form.options.filter(o => o.trim());
    if (!form.question.trim() || filledOptions.length < 2) {
      return flash('Question and at least 2 options are required.', 'error');
    }
    setSaving(true);
    const payload = { ...form, options: form.options.filter(o => o.trim()), answer: Number(form.answer) };

    if (editing) {
      await fetch(`/api/questions/${editing}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      flash('Question updated!');
      setEditing(null);
    } else {
      await fetch('/api/questions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
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
    setForm({ question: q.question, image: q.image || '', options: [...q.options, '', '', '', ''].slice(0, 4), answer: q.answer, category: q.category, difficulty: q.difficulty, reference: q.reference || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(201,168,76,0.25)', color: '#f5f0e8', borderRadius: 4,
    fontSize: '0.9rem', outline: 'none', fontFamily: 'Lato, sans-serif',
  };
  const labelStyle = { display: 'block', fontSize: '0.75rem', color: 'rgba(201,168,76,0.7)', marginBottom: 6, fontFamily: 'Cinzel, serif', letterSpacing: '0.07em' };

  return (
    <>
      <Head>
        <title>Admin — Sacred Word</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navbar />

      {/* Toast */}
      {msg && (
        <div style={{
          position: 'fixed', top: 76, left: '50%', transform: 'translateX(-50%)', zIndex: 200,
          padding: '12px 28px', borderRadius: 6, fontSize: '0.9rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.06em',
          background: msg.type === 'error' ? 'rgba(224,82,82,0.9)' : 'rgba(76,175,125,0.9)',
          color: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>
          {msg.text}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card" style={{ maxWidth: 400, width: '100%', padding: 32, textAlign: 'center' }}>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.05rem', marginBottom: 8, color: '#f5f0e8' }}>Delete this question?</p>
            <p style={{ fontSize: '0.85rem', color: 'rgba(245,240,232,0.5)', marginBottom: 24 }}>This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => deleteQuestion(deleteConfirm)} style={{ padding: '10px 24px', background: '#8b1a1a', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: '0.8rem' }}>DELETE</button>
              <button onClick={() => setDeleteConfirm(null)} className="btn-outline" style={{ padding: '10px 24px' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '40px 20px 80px' }}>
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.72rem', letterSpacing: '0.2em', color: '#c9a84c', marginBottom: 8 }}>ADMIN PANEL</p>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', color: '#f5f0e8' }}>
            {editing ? 'Edit Question' : 'Add New Question'}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={saveQuestion} style={{ marginBottom: 56 }}>
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
              {/* Question */}
              <div>
                <label style={labelStyle}>QUESTION *</label>
                <textarea
                  value={form.question}
                  onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                  rows={3}
                  placeholder="Enter your Bible question..."
                  style={{ ...inputStyle, resize: 'vertical' }}
                  required
                />
              </div>

              {/* Image URL */}
              <div>
                <label style={labelStyle}>IMAGE URL (optional)</label>
                <input
                  type="url"
                  value={form.image}
                  onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  style={inputStyle}
                />
                {form.image && (
                  <div style={{ marginTop: 10 }}>
                    <img src={form.image} alt="Preview" style={{ maxHeight: 160, borderRadius: 4, objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
                  </div>
                )}
              </div>

              {/* Options */}
              <div>
                <label style={labelStyle}>ANSWER OPTIONS * (mark correct with radio)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {form.options.map((opt, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <input
                        type="radio"
                        name="correct"
                        checked={form.answer === i}
                        onChange={() => setForm(f => ({ ...f, answer: i }))}
                        style={{ accentColor: '#c9a84c', width: 18, height: 18, flexShrink: 0 }}
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={e => {
                          const opts = [...form.options];
                          opts[i] = e.target.value;
                          setForm(f => ({ ...f, options: opts }));
                        }}
                        placeholder={`Option ${String.fromCharCode(65+i)}${i < 2 ? ' (required)' : ''}`}
                        style={{ ...inputStyle, flex: 1 }}
                      />
                      {form.answer === i && (
                        <span style={{ fontSize: '0.7rem', color: '#4caf7d', fontFamily: 'Cinzel, serif', flexShrink: 0 }}>✓ CORRECT</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Meta */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                <div>
                  <label style={labelStyle}>CATEGORY</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputStyle}>
                    {['Old Testament', 'New Testament', 'General'].map(c => (
                      <option key={c} value={c} style={{ background: '#0d1b3e' }}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>DIFFICULTY</label>
                  <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))} style={inputStyle}>
                    {['easy', 'medium', 'hard'].map(d => (
                      <option key={d} value={d} style={{ background: '#0d1b3e' }}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>SCRIPTURE REFERENCE</label>
                  <input type="text" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} placeholder="e.g. John 3:16" style={inputStyle} />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
              <button type="submit" className="btn-gold" style={{ padding: '12px 32px', fontSize: '0.85rem' }} disabled={saving}>
                {saving ? 'SAVING...' : editing ? 'UPDATE QUESTION' : 'ADD QUESTION'}
              </button>
              {editing && (
                <button type="button" onClick={() => { setEditing(null); setForm(EMPTY_FORM); }} className="btn-outline" style={{ padding: '12px 24px' }}>
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Question list */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', letterSpacing: '0.1em', color: '#c9a84c' }}>
              ALL QUESTIONS ({questions.length})
            </h2>
          </div>

          {loading && <p className="loading-pulse" style={{ color: 'rgba(245,240,232,0.4)', textAlign: 'center', padding: '40px 0' }}>Loading...</p>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {questions.map((q, i) => (
              <div key={q.id} className="card" style={{ padding: '18px 20px', display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: 'rgba(201,168,76,0.4)', minWidth: 24, paddingTop: 2 }}>
                  {String(i+1).padStart(2,'0')}
                </span>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p style={{ fontSize: '0.95rem', color: '#f5f0e8', marginBottom: 6, lineHeight: 1.4 }}>{q.question}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.7rem', color: '#c9a84c', fontFamily: 'Cinzel, serif', background: 'rgba(201,168,76,0.1)', padding: '2px 8px', borderRadius: 10 }}>{q.category}</span>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(245,240,232,0.4)', fontFamily: 'Cinzel, serif', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 10 }}>{q.difficulty}</span>
                    {q.reference && <span style={{ fontSize: '0.7rem', color: 'rgba(245,240,232,0.3)' }}>{q.reference}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => editQuestion(q)} className="btn-outline" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>Edit</button>
                  <button onClick={() => setDeleteConfirm(q.id)} style={{ padding: '6px 14px', fontSize: '0.75rem', background: 'rgba(139,26,26,0.3)', border: '1px solid rgba(139,26,26,0.5)', color: '#e08888', borderRadius: 4, cursor: 'pointer', fontFamily: 'Cinzel, serif' }}>Del</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
