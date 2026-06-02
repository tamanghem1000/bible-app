import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  // --- FETCH QUESTIONS (With Filters) ---
  if (req.method === 'GET') {
    const { category, difficulty, book, chapter } = req.query;
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
    const { question, image_url, options, answer, category, difficulty, scripture_reference, book, chapter } = req.body;

    const { data, error } = await supabase.from('questions').insert([{ 
      question, 
      image_url: image_url || '', 
      options, 
      answer: Number(answer), 
      category: category || 'General', 
      difficulty: difficulty || 'medium', 
      scripture_reference: scripture_reference || '',
      book: book || 'Genesis',
      chapter: Number(chapter) || 1
    }]).select();

    return error ? res.status(500).json({ error: error.message }) : res.status(201).json(data[0]);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}