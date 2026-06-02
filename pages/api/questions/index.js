import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { difficulty, book } = req.query; 
    
    let query = supabase.from('questions').select('*');

    // Filter by book ONLY if it was provided
    if (book) {
      query = query.eq('book', book);
    }

    // MANDATORY: Filter by difficulty (This ensures it is never random)
    if (difficulty) {
      query = query.eq('difficulty', Number(difficulty));
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { question, options, answer, category, difficulty, scripture_reference, book, chapter } = req.body;
    const { data, error } = await supabase.from('questions').insert([{ 
      question, options, answer: Number(answer), category, 
      difficulty: Number(difficulty), scripture_reference, book, chapter: Number(chapter) 
    }]).select();
    return error ? res.status(500).json({ error: error.message }) : res.status(201).json(data[0]);
  }
}