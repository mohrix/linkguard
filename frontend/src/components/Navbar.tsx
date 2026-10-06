import { Link, NavLink } from 'react-router-dom';
const linkCls = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm transition-colors ${isActive ? 'text-primary bg-primary/10' : 'text-slate-300 hover:text-white hover:bg-border'}`;
export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15 text-primary font-bold">LG</span>
          <span className="font-semibold text-slate-100">LinkGuard</span>
          <span className="hidden sm:inline text-xs text-slate-500 ml-1">Analyze Before You Trust</span>
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink to="/" className={linkCls} end>Scanner</NavLink>
          <NavLink to="/history" className={linkCls}>History</NavLink>
        </nav>
      </div>
    </header>
  );
}
