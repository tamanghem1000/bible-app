# Sacred Word — Bible Browser & Quiz App

A beautiful, responsive Bible reading and quiz application built with Next.js.

## Features

- 📖 **Bible Browser** — Read all 66 books, searchable by book & chapter (KJV via bible-api.com)
- 🧠 **Interactive Quiz** — Image-enhanced multiple-choice questions with scoring
- ⚙️ **Admin Panel** — Add/edit/delete quiz questions with images, categories, difficulty
- 📱 **Fully Responsive** — Works on mobile, tablet, and desktop

---

## Getting Started (Local Development)

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

### Option 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (from project root)
vercel

# Deploy to production
vercel --prod
```

### Option 2: GitHub + Vercel Dashboard

1. Push this project to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/bible-app.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) → New Project → Import your GitHub repo

3. Leave all settings as default → Click **Deploy**

---

## Important: Data Persistence on Vercel

> ⚠️ **Note:** The quiz questions are stored in `public/data/questions.json`. On Vercel, the file system is **read-only** after deployment, so admin edits won't persist across deployments.

### Recommended Solutions for Production:

**Option A — Vercel KV (Redis)**
```bash
npm install @vercel/kv
```
Update `pages/api/questions.js` and `pages/api/questions/[id].js` to use `kv.get/set` instead of `fs`.

**Option B — Supabase (PostgreSQL)**
```bash
npm install @supabase/supabase-js
```
Create a `questions` table and replace the file-based storage with Supabase queries.

**Option C — MongoDB Atlas (Free tier)**
```bash
npm install mongodb
```
Connect via `MONGODB_URI` environment variable in Vercel settings.

---

## Project Structure

```
bible-app/
├── pages/
│   ├── index.js          # Home / landing page
│   ├── bible.js          # Bible reader
│   ├── quiz.js           # Interactive quiz
│   ├── admin.js          # Admin panel
│   └── api/
│       ├── bible.js      # Bible chapter proxy (bible-api.com)
│       ├── questions.js  # GET all / POST new question
│       └── questions/
│           └── [id].js   # PUT edit / DELETE question
├── components/
│   └── Navbar.js
├── lib/
│   └── bibleBooks.js     # All 66 books metadata
├── public/
│   └── data/
│       └── questions.json  # Quiz question database
└── styles/
    └── globals.css
```

---

## Adding Quiz Questions

Visit `/admin` in your browser to add questions through the UI, or edit `public/data/questions.json` directly.

### Question format:
```json
{
  "id": "q_unique_id",
  "question": "Your question here?",
  "image": "https://url-to-image.jpg",  // optional
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "answer": 0,  // index of correct option (0-based)
  "category": "Old Testament",  // Old Testament | New Testament | General
  "difficulty": "medium",  // easy | medium | hard
  "reference": "Genesis 1:1"  // optional
}
```

---

## Bible API

This app uses [bible-api.com](https://bible-api.com) — a free, open-source Bible API. No API key required. Uses KJV translation by default.

---

## Customization

- **Fonts & Colors**: Edit `styles/globals.css` CSS variables
- **Bible translation**: Change `?translation=kjv` in `pages/api/bible.js`
- **Add categories**: Update category arrays in `pages/quiz.js` and `pages/admin.js`
