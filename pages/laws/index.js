import Link from 'next/link';
import questions from '@/data/questions.json';
import { LAWS } from '@/lib/constants';

export default function LawsPage() {
  const counts = questions.reduce((acc, question) => {
    acc[question.law] = (acc[question.law] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="stack-lg">
      <section className="stack-sm">
        <h1>תרגול לפי חוק</h1>
        <p className="muted">בחר חוק לתרגול. חוקים בלי שאלות מוצגים כזמינים בקרוב.</p>
      </section>

      <section className="laws-grid">
        {LAWS.map((law) => {
          const count = counts[law.number] || 0;
          const active = count > 0;
          const content = (
            <>
              <div className="stack-xs">
                <span className="law-number">חוק {law.number}</span>
                <h2>{law.name}</h2>
              </div>
              <div className="law-footer">
                <span>{count} שאלות</span>
                <span className={`status ${active ? 'status-active' : 'status-locked'}`}>
                  {active ? 'פתח תרגול' : 'בקרוב'}
                </span>
              </div>
            </>
          );

          return active ? (
            <Link key={law.number} href={`/laws/${law.number}`} className="card law-card interactive">
              {content}
            </Link>
          ) : (
            <div key={law.number} className="card law-card law-card-locked" aria-disabled="true">
              {content}
            </div>
          );
        })}
      </section>
    </div>
  );
}
