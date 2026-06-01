import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'public', 'data', 'questions.json');

function readQuestions() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeQuestions(questions) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(questions, null, 2));
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    const questions = readQuestions();
    const { category, difficulty } = req.query;
    let filtered = questions;
    if (category && category !== 'All') filtered = filtered.filter(q => q.category === category);
    if (difficulty && difficulty !== 'All') filtered = filtered.filter(q => q.difficulty === difficulty);
    return res.status(200).json(filtered);
  }

  if (req.method === 'POST') {
    const { question, image, options, answer, category, difficulty, reference } = req.body;
    if (!question || !options || options.length < 2 || answer === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const questions = readQuestions();
    const newQ = {
      id: `q${Date.now()}`,
      question,
      image: image || '',
      options,
      answer: Number(answer),
      category: category || 'General',
      difficulty: difficulty || 'medium',
      reference: reference || '',
    };
    questions.push(newQ);
    writeQuestions(questions);
    return res.status(201).json(newQ);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
