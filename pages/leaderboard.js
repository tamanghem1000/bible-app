import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

export default function LeaderboardPage() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScores() {
      try {
        const res = await fetch('/api/leaderboard');
        // Check if response is ok
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        
        // Ensure we are working with an array
        setScores(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load scores:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchScores();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200">
      <Navbar />
      <main className="max-w-2xl mx-auto p-6 md:p-12">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-black text-white">Global <span className="text-yellow-500">Standings</span></h1>
          <p className="text-slate-500 mt-2 font-medium">Top performers across the platform</p>
        </header>

        {loading ? (
          <div className="text-center py-20 text-slate-600 font-bold">LOADING DATA...</div>
        ) : (
          <div className="bg-[#0c0c0c] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            {scores.length > 0 ? (
              scores.map((s, i) => (
                <div 
                  key={s.id || i} 
                  className="flex items-center justify-between p-6 border-b border-slate-800 last:border-0 hover:bg-[#151515] transition-all duration-300"
                >
                  <div className="flex items-center gap-6">
                    <span className={`text-xl font-black w-8 ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-orange-700' : 'text-slate-700'}`}>
                      #{i + 1}
                    </span>
                    <div>
                      {/* Using fallback for name in case it's null */}
                      <p className="font-bold text-white">{s.name || "Anonymous"}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                        {s.total || 0} Questions Answered
                      </p>
                    </div>
                  </div>
                  <div className="bg-yellow-600/10 border border-yellow-600/20 text-yellow-500 px-4 py-2 rounded-xl font-black text-sm">
                    {s.score || 0} PTS
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-12 text-slate-600">No scores recorded yet. Be the first!</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}