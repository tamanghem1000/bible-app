import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {

  // --- FETCH QUESTIONS ---
  if (req.method === 'GET') {
    try {
      const { category, difficulty } = req.query;

      let query = supabase.from('questions').select('*').order('created_at', { ascending: false });

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

  // --- ADD NEW QUESTION ---
  if (req.method === 'POST') {
    try {
      const { question, image_url, options, answer, category, difficulty, scripture_reference } = req.body;

      if (!question || !options || options.length < 2 || answer === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { data, error } = await supabase
        .from('questions')
        .insert([{ question, image_url: image_url || '', options, answer: Number(answer), category: category || 'General', difficulty: difficulty || 'medium', scripture_reference: scripture_reference || '' }])
        .select();

      if (error) throw error;
      return res.status(201).json(data[0]);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- EDIT QUESTION ---
  if (req.method === 'PUT') {
    try {
      const { id, question, image_url, options, answer, category, difficulty, scripture_reference } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Question ID is required' });
      }

      const { data, error } = await supabase
        .from('questions')
        .update({ question, image_url, options, answer: Number(answer), category, difficulty, scripture_reference })
        .eq('id', id)
        .select();

      if (error) throw error;
      return res.status(200).json(data[0]);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- DELETE QUESTION ---
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Question ID is required' });
      }

      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ message: 'Question deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}