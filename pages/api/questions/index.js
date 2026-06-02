import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // --- HANDLE GET (FETCH QUESTIONS) ---
  if (req.method === 'GET') {
    const { difficulty, book } = req.query; 
    
    let query = supabase.from('questions').select('*');

    // 1. Filter by book only if it's provided and valid
    if (book && book !== 'undefined' && book !== 'General') {
      query = query.eq('book', book);
    }

    // 2. Filter by difficulty - Ensure it is parsed as a base-10 integer
    if (difficulty && difficulty !== 'undefined') {
      query = query.eq('difficulty', parseInt(difficulty, 10));
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // 3. Return the data, or an empty array if nothing matches
    return res.status(200).json(data || []);
  }

  // --- HANDLE POST (ADD NEW QUESTION) ---
  if (req.method === 'POST') {
    const { 
      question, options, answer, category, 
      difficulty, scripture_reference, book, chapter 
    } = req.body;

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

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.status(201).json(data[0]);
  }

  // Handle other methods
  res.status(405).json({ error: 'Method not allowed' });
}