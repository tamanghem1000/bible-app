import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  const { id } = req.query; // This extracts the ID from the URL path automatically

  // 1. --- HANDLE UPDATE (PUT) ---
  if (req.method === 'PUT') {
    try {
      const { question, image, options, answer, category, difficulty, reference } = req.body;

      const { data, error } = await supabase
        .from('questions')
        .update({
          question,
          image_url: image, // Maps the form's image string to your Supabase column
          options,
          answer: Number(answer),
          category,
          difficulty,
          scripture_reference: reference, // Maps the form's reference string to your Supabase column
        })
        .eq('id', id)
        .select();

      if (error) throw error;
      return res.status(200).json(data[0]);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // 2. --- HANDLE DELETE (DELETE) ---
  if (req.method === 'DELETE') {
    try {
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

  // Fallback if someone hits this endpoint with a POST or GET request
  res.setHeader('Allow', ['PUT', 'DELETE']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}