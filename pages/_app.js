import '@/styles/globals.css';
import Navigation from '@/components/Navigation';
import { Analytics } from '@vercel/analytics/next';

export default function App({ Component, pageProps }) {
  return (
    <div className="site-shell">
      <Navigation />

      <main className="page-shell">
        <Component {...pageProps} />
      </main>
      <Analytics />

      <footer className="site-footer">
        © 2026 Benjamin Shifrin. All Rights Reserved.
      </footer>
    </div>
  );
}