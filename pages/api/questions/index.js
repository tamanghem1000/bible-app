import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  // --- GET QUESTIONS ---
  if (req.method === 'GET') {
    const { difficulty, book } = req.query;
    let query = supabase.from('questions').select('*');

    if (difficulty) query = query.eq('difficulty', Number(difficulty));
    if (book && book !== 'General' && book !== 'undefined') query = query.eq('book', book);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data || []);
  }

  // --- POST NEW QUESTION ---
  if (req.method === 'POST') {
    try {
      const { question, options, answer, category, difficulty, scripture_reference, book, chapter } = req.body;
      const { data, error } = await supabase.from('questions').insert([{
        question, options, answer: Number(answer), category,
        difficulty: Number(difficulty), scripture_reference, book, chapter: Number(chapter)
      }]).select();

      if (error) throw error;
      return res.status(201).json(data[0]);
    } catch (err) {
      console.error("API Error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}