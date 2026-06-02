import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  // --- FETCH QUESTIONS ---
  if (req.method === 'GET') {
    const { category, difficulty, book, chapter } = req.query;
    
    // If fetching unique books for dropdown
    if (req.query.fetch_books) {
      const { data } = await supabase.from('questions').select('book');
      return res.status(200).json([...new Set(data.map(q => q.book))]);
    }

    let query = supabase.from('questions').select('*').order('created_at', { ascending: false });
    if (category && category !== 'All') query = query.eq('category', category);
    if (difficulty && difficulty !== 'All') query = query.eq('difficulty', difficulty);
    if (book) query = query.eq('book', book);
    if (chapter) query = query.eq('chapter', Number(chapter));

    const { data, error } = await query;
    return error ? res.status(500).json({ error: error.message }) : res.status(200).json(data);
  }

  // --- ADD NEW QUESTION ---
  if (req.method === 'POST') {
    const { question, options, answer, category, difficulty, scripture_reference, book, chapter } = req.body;

    const { data, error } = await supabase.from('questions').insert([{ 
      question, 
      options, 
      answer: Number(answer), 
      category, 
      difficulty, 
      scripture_reference, // New
      book,                // New
      chapter: Number(chapter) // New
    }]).select();

    return error ? res.status(500).json({ error: error.message }) : res.status(201).json(data[0]);
  }
}