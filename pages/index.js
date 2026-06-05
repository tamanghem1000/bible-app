import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import BibleChatBot from '../components/BibleChatBot';

export default function Home() {
  return (
    <>
      <Head>
        <title>Gods Word — Bible & Quiz</title>
        <meta name="description" content="Read the Bible and test your knowledge with our interactive quiz." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />

      <main>
        {/* Hero */}
        <section style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '60px 24px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background decoration */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 50% 30%, rgba(201,168,76,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '0.25em', color: '#c9a84c', marginBottom: 24, opacity: 0.8 }}>
            THY WORD IS A LAMP UNTO MY FEET — PSALM 119:105
          </p>

          <h1 style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 'clamp(2.4rem, 7vw, 5rem)',
            fontWeight: 700,
            letterSpacing: '0.06em',
            lineHeight: 1.1,
            color: '#f5f0e8',
            marginBottom: 28,
            maxWidth: 700,
          }}>
            SACRED<br />
            <span style={{ color: '#c9a84c' }}>WORD</span>
          </h1>

          <p style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            color: 'rgba(245,240,232,0.7)',
            maxWidth: 500,
            lineHeight: 1.7,
            marginBottom: 48,
          }}>
            Explore the Holy Scriptures at your own pace, then challenge yourself with our interactive Bible quiz.
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/bible">
              <button className="btn-gold" style={{ padding: '14px 36px', fontSize: '0.9rem', letterSpacing: '0.1em' }}>
                READ THE BIBLE
              </button>
            </Link>
            <Link href="/quiz">
              <button className="btn-outline" style={{ padding: '14px 36px', fontSize: '0.9rem' }}>
                TAKE THE QUIZ
              </button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {[
            {
              icon: '📖',
              title: 'Full Bible',
              desc: 'Browse all 66 books of the Bible — Old and New Testament — with clean, readable formatting.',
            },
            {
              icon: '🧠',
              title: 'Interactive Quiz',
              desc: 'Test your knowledge with image-enhanced questions, multiple choice answers, and score tracking.',
            },
            {
              icon: '⚙️',
              title: 'Admin Panel',
              desc: 'Easily add, edit, and manage quiz questions with images, categories, and difficulty levels.',
            },
          ].map(f => (
            <div key={f.title} className="card" style={{ padding: '32px 28px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', letterSpacing: '0.08em', color: '#c9a84c', marginBottom: 12 }}>
                {f.title}
              </h3>
              <p style={{ color: 'rgba(245,240,232,0.65)', lineHeight: 1.7, fontSize: '0.95rem' }}>{f.desc}</p>
            </div>
          ))}
        </section>

        {/* CTA banner */}
        <section style={{
          background: 'linear-gradient(135deg, rgba(139,26,26,0.15), rgba(201,168,76,0.08))',
          borderTop: '1px solid rgba(201,168,76,0.15)',
          borderBottom: '1px solid rgba(201,168,76,0.15)',
          padding: '56px 24px',
          textAlign: 'center',
        }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(1.2rem, 4vw, 2rem)', color: '#e8c87a', marginBottom: 16 }}>
            Ready to Test Your Knowledge?
          </h2>
          <p style={{ color: 'rgba(245,240,232,0.6)', marginBottom: 28, fontFamily: 'Playfair Display, serif' }}>
            Over 10 carefully crafted questions — more added regularly.
          </p>
          <Link href="/quiz">
            <button className="btn-gold" style={{ padding: '14px 40px', fontSize: '0.9rem' }}>
              START QUIZ →
            </button>
          </Link>
        </section>

        <footer style={{ textAlign: 'center', padding: '32px 24px', color: 'rgba(245,240,232,0.3)', fontSize: '0.8rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.08em' }}>
          SACRED WORD · BUILT WITH ♥ · {new Date().getFullYear()}
        </footer>
        
        {/* Chatbot integrated */}
        <BibleChatBot />
      </main>
    </>
  );
}