import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const navLinkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
    isActive ? 'text-brand bg-brand/10' : 'text-slate-600 hover:text-navy hover:bg-slate-100'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate('/');
  }

  const initials = user?.name ? user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() : '';

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-navy to-brand text-white flex items-center justify-center font-display font-bold text-lg">
            B
          </span>
          <span className="font-display font-extrabold text-lg text-navy">BorrowBox</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" end className={navLinkClass}>Browse</NavLink>
          {user && <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>}
          {user && <NavLink to="/items/new" className={navLinkClass}>List an item</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <>
              <Link to="/login" className="px-4 py-2 rounded-xl text-sm font-semibold text-navy border border-slate-200 hover:bg-slate-50 transition">
                Login
              </Link>
              <Link to="/register" className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-navy to-brand hover:opacity-90 shadow-soft transition">
                Register
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition"
              >
                <span className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo to-brand text-white text-xs font-bold flex items-center justify-center">
                  {initials}
                </span>
                <span className="text-sm font-semibold text-navy">{user.name.split(' ')[0]}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-soft border border-slate-100 py-2 animate-fadeInUp">
                  <Link to={`/profile/${user.id}`} onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">My public profile</Link>
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Dashboard</Link>
                  <Link to="/settings" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Account settings</Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-rose-500 hover:bg-rose-50">Logout</button>
                </div>
              )}
            </div>
          )}
        </div>

        <button className="md:hidden p-2 text-navy" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-100 px-4 py-3 space-y-1 bg-white animate-fadeInUp">
          <NavLink to="/" end onClick={() => setOpen(false)} className={navLinkClass}>Browse</NavLink>
          {user && <NavLink to="/dashboard" onClick={() => setOpen(false)} className={navLinkClass}>Dashboard</NavLink>}
          {user && <NavLink to="/items/new" onClick={() => setOpen(false)} className={navLinkClass}>List an item</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin" onClick={() => setOpen(false)} className={navLinkClass}>Admin</NavLink>}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {!user ? (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-navy border border-slate-200 text-center">Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-navy to-brand text-center">Register</Link>
              </>
            ) : (
              <button onClick={handleLogout} className="px-4 py-2 rounded-xl text-sm font-semibold text-rose-500 border border-rose-200 text-left">Logout</button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
