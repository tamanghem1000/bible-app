import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  // --- FETCH QUESTIONS ---
  if (req.method === 'GET') {
    const { difficulty, book } = req.query; 
    
    // Start base query
    let query = supabase.from('questions').select('*');

    // 1. Filter by Book if it's not "General"
    if (book && book !== 'General') {
      query = query.eq('book', book);
    }

    // 2. Filter by Difficulty (Level 1, 2, or 3)
    if (difficulty) {
      query = query.eq('difficulty', Number(difficulty));
    }

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
      difficulty: Number(difficulty), 
      scripture_reference, 
      book, 
      chapter: Number(chapter) 
    }]).select();

    return error ? res.status(500).json({ error: error.message }) : res.status(201).json(data[0]);
  }
}