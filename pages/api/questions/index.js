import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // Prevent browser caching so you always get fresh data
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'GET') {
    const { difficulty, book } = req.query; 

    // Build the base query
    let query = supabase.from('questions').select('*');

    // Filter by difficulty (Force Number)
    if (difficulty) {
      query = query.eq('difficulty', Number(difficulty));
    }

    // Filter by book (Only if NOT 'General')
    if (book && book !== 'General' && book !== 'undefined') {
      query = query.eq('book', book);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    
    return res.status(200).json(data || []);
  }

  if (req.method === 'POST') {
    // ... (Keep your existing POST code)
  }
}