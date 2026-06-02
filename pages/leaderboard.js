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
        setScores(data);
      } catch (err) {
        console.error("Failed to load scores");
      } finally {
        setLoading(false);
      }
    }
    fetchScores();
  }, []);

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 600, margin: '40px auto', padding: 20, color: '#fff' }}>
        <h1 style={{ color: '#c9a84c' }}>Leaderboard</h1>
        {loading ? <p>Loading...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #c9a84c' }}>
                <th style={{ textAlign: 'left', padding: 10 }}>Name</th>
                <th style={{ textAlign: 'center', padding: 10 }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: 10 }}>{s.name}</td>
                  <td style={{ textAlign: 'center', padding: 10 }}>{s.score} / {s.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </>
  );
}