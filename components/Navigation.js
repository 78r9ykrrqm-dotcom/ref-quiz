import Link from 'next/link';
import { useRouter } from 'next/router';

const links = [
  { href: '/', label: 'בית' },
  { href: '/laws', label: 'לפי חוק' },
  { href: '/exam', label: 'מבחן אקראי' },
  { href: '/timed', label: 'לחץ זמן' },
  { href: '/review', label: 'טעויות שלי' },
];

export default function Navigation() {
  const router = useRouter();
  const pathname = router.asPath;

  return (
    <nav className="top-nav">
      <div className="nav-inner">
        <div className="brand">שופטים • IFAB</div>
        <div className="nav-links">
          {links.map((link) => {
            const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href} className={`nav-link ${active ? 'nav-link-active' : ''}`}>
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
