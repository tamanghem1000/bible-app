import { createClient } from '@supabase/supabase-js';

// 1. Initialize the Supabase connection client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  
  // --- FETCH QUESTIONS FROM SUPABASE ---
  if (req.method === 'GET') {
    try {
      const { category, difficulty } = req.query;
      
      let query = supabase.from('questions').select('*').order('created_at', { ascending: false });

      // Apply your category and difficulty filters directly to the database query
      if (category && category !== 'All') {
        query = query.eq('category', category);
      }
      if (difficulty && difficulty !== 'All') {
        query = query.eq('difficulty', difficulty);
      }

      const { data, error } = await query;
      if (error) throw error;

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- SAVE NEW QUESTION TO SUPABASE ---
  if (req.method === 'POST') {
    try {
      const { question, image, options, answer, category, difficulty, reference } = req.body;
      
      // Validation check
      if (!question || !options || options.length < 2 || answer === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Map your old form keys (image, reference) to your database column names (image_url, scripture_reference)
      const { data, error } = await supabase
        .from('questions')
        .insert([
          {
            question,
            image_url: image || '',
            options,
            answer: Number(answer),
            category: category || 'General',
            difficulty: difficulty || 'medium',
            scripture_reference: reference || '',
          }
        ])
        .select();

      if (error) throw error;

      // Return the newly created database row back to your frontend layout
      return res.status(201).json(data[0]);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Fallback for unhandled request methods
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}