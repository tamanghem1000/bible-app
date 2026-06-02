import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Ensure this key is in your .env file
);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(20);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { name, score, total } = req.body;
    
    // Server-side insert using Service Role Key
    const { error } = await supabase
      .from('leaderboard')
      .insert([{ name, score, total }]);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ success: true });
  }

  return res.status(405).end();
}