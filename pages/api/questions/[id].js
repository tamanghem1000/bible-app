import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  const { id } = req.query;

  // --- HANDLE UPDATE (PUT) ---
  if (req.method === 'PUT') {
    const { question, options, answer, category, difficulty, scripture_reference, book, chapter } = req.body;

    const { data, error } = await supabase
      .from('questions')
      .update({
        question,
        options,
        answer: Number(answer),
        category,
        difficulty,
        scripture_reference, // Must be included here
        book,
        chapter: Number(chapter)
      })
      .eq('id', id)
      .select();

    return error ? res.status(500).json({ error: error.message }) : res.status(200).json(data[0]);
  }

  // --- HANDLE DELETE ---
  if (req.method === 'DELETE') {
    const { error } = await supabase.from('questions').delete().eq('id', id);
    return error ? res.status(500).json({ error: error.message }) : res.status(200).json({ message: 'Success' });
  }

  res.status(405).json({ error: 'Method not allowed' });
}