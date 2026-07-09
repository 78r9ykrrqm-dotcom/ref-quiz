import Head from 'next/head';
import Link from 'next/link';
import questions from '@/data/questions.json';
import ProfileBox from '@/components/ProfileBox';
import { LAWS } from '@/lib/constants';

export default function HomePage() {
  const availableLaws = new Set(questions.map((q) => q.law)).size;

  return (
    <>
      <Head>
        <title>חוקת הכדורגל — תרגול לשופטים</title>
      </Head>
      <div className="stack-lg">
        <section className="hero card">
          <div className="stack-md">
            <span className="pill">IFAB 2026/27</span>
            <div className="stack-sm">
              <h1>חוקת הכדורגל — תרגול לשופטים</h1>
              <p className="muted big-text">
                תרגל שאלות לפי חוק, עשה מבחן אקראי, או בדוק את עצמך תחת לחץ זמן.
              </p>
            </div>
            <div className="cta-grid">
              <Link className="button primary" href="/laws">תרגול לפי חוק</Link>
              <Link className="button" href="/exam">מבחן אקראי</Link>
              <Link className="button" href="/timed">מבחן עם זמן</Link>
              <Link className="button" href="/review">טעויות שלי</Link>
            </div>
          </div>
        </section>

        <section className="stats-grid">
          <div className="card stat-card">
            <span className="stat-label">מספר שאלות במאגר</span>
            <strong>{questions.length}</strong>
          </div>
          <div className="card stat-card">
            <span className="stat-label">חוקים זמינים</span>
            <strong>{availableLaws} מתוך {LAWS.length}</strong>
          </div>
          <div className="card stat-card">
            <span className="stat-label">עונה</span>
            <strong>2026/27</strong>
          </div>
        </section>

        <ProfileBox />
      </div>
    </>
  );
}
