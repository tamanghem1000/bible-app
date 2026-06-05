export default async function handler(req, res) {
  const { book, chapter } = req.query;
  if (!book || !chapter) return res.status(400).json({ error: 'book and chapter required' });

  try {
    // bible-api.com is a free, open Bible API
    const url = `https://bible-api.com/${encodeURIComponent(book)}+${chapter}?translation=kjv`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch chapter', message: e.message });
  }
}
