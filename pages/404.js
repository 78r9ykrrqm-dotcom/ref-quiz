import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="card stack-md">
      <h1>העמוד לא נמצא</h1>
      <p className="muted">או שהחוק לא קיים, או שעוד אין לו שאלות.</p>
      <Link href="/" className="button primary">חזרה לבית</Link>
    </div>
  );
}
