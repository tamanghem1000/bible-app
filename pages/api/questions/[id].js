import { createClient } from '@supabase/supabase-js';

// Connect to your online Supabase instance using your environment keys
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { id } = req.query; // Grabs the question ID from the URL pointer

  // 1. PUT: Update an existing question inside Supabase
  if (req.method === 'PUT') {
    const { data, error } = await supabase
      .from('questions')
      .update(req.body)
      .eq('id', id)
      .select();

    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.length === 0) return res.status(404).json({ error: 'Question not found' });
    
    return res.status(200).json(data[0]);
  }

  // 2. DELETE: Permanently remove a question from Supabase
  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}