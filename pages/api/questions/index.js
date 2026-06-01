import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  // --- HANDLE GET REQUESTS (Fetching Questions) ---
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- HANDLE POST REQUESTS (Adding New Questions) ---
  if (req.method === 'POST') {
    try {
      const { 
        question, 
        image_url, 
        options, 
        answer, 
        category, 
        difficulty, 
        scripture_reference 
      } = req.body;

      const { data, error } = await supabase
        .from('questions')
        .insert([
          { 
            question, 
            image_url, 
            options, 
            answer, 
            category, 
            difficulty, 
            scripture_reference 
          }
        ])
        .select();

      if (error) throw error;
      return res.status(201).json(data[0]);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // If a request comes in that isn't a GET or POST
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}