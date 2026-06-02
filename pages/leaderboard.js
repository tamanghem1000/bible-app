import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

export default function LeaderboardPage() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScores() {
      try {
        const res = await fetch('/api/leaderboard');
        const data = await res.json();
        setScores(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchScores();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200">
      <Navbar />
      <main className="max-w-2xl mx-auto p-6">
        <h1 className="text-4xl font-black text-white mb-8 text-center">Global Standings</h1>
        {loading ? <div className="text-center">Loading...</div> : (
          <div className="bg-[#0c0c0c] border border-slate-800 rounded-3xl p-6">
            {scores.map((s, i) => (
              <div key={s.id} className="flex justify-between py-4 border-b border-slate-800">
                <span>{s.name}</span>
                <span className="text-yellow-500 font-bold">{s.score} / {s.total}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}