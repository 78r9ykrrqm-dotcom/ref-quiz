import '@/styles/globals.css';
import Navigation from '@/components/Navigation';

export default function App({ Component, pageProps }) {
  return (
    <div className="site-shell">
      <Navigation />

      <main className="page-shell">
        <Component {...pageProps} />
      </main>

      <footer className="site-footer">
        © 2026 Benjamin Shifrin. All Rights Reserved.
      </footer>
    </div>
  );
}