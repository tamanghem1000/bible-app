import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'public', 'data', 'questions.json');

function readQuestions() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')); }
  catch { return []; }
}
function writeQuestions(q) { fs.writeFileSync(DATA_FILE, JSON.stringify(q, null, 2)); }

export default function handler(req, res) {
  const { id } = req.query;
  const questions = readQuestions();

  if (req.method === 'DELETE') {
    const updated = questions.filter(q => q.id !== id);
    if (updated.length === questions.length) return res.status(404).json({ error: 'Not found' });
    writeQuestions(updated);
    return res.status(200).json({ success: true });
  }

  if (req.method === 'PUT') {
    const idx = questions.findIndex(q => q.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    questions[idx] = { ...questions[idx], ...req.body, id };
    writeQuestions(questions);
    return res.status(200).json(questions[idx]);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
