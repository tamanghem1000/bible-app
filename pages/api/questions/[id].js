import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  const { id } = req.query;

  // 1. --- HANDLE UPDATE (PUT) ---
  if (req.method === 'PUT') {
    try {
      const { question, image, options, answer, category, difficulty, reference, book, chapter } = req.body;

      const { data, error } = await supabase
        .from('questions')
        .update({
          question,
          image_url: image,
          options,
          answer: Number(answer),
          category,
          difficulty,
          scripture_reference: reference,
          book: book,             // Added
          chapter: Number(chapter) // Added
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

  res.setHeader('Allow', ['PUT', 'DELETE']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}