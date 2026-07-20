import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, Search, Menu, X, LayoutDashboard, Shield, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/books', label: 'Books' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <nav
      style={{
        background: 'rgba(8,14,26,0.85)',
        borderBottom: '1px solid rgba(31,45,66,0.7)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
      className="sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
              style={{
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                boxShadow: '0 4px 16px rgba(79,70,229,0.45)',
              }}
            >
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-[1.1rem] text-white hidden sm:block tracking-tight">
              Digital<span className="gradient-text">Library</span>
            </span>
          </Link>

          {/* ── Desktop Links ── */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* ── Right Controls ── */}
          <div className="flex items-center gap-2">
            {/* Search icon */}
            <Link to="/books" className="btn-icon hidden sm:flex" title="Search books">
              <Search size={17} />
            </Link>

            {isAuthenticated ? (
              /* ── User Dropdown ── */
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-all duration-200"
                  style={{
                    background: userMenuOpen ? 'rgba(79,70,229,0.15)' : 'rgba(17,24,39,0.6)',
                    borderColor: userMenuOpen ? 'rgba(99,102,241,0.4)' : 'rgba(31,45,66,0.7)',
                  }}
                >
                  <div className="avatar-sm" style={{ width: '1.9rem', height: '1.9rem', fontSize: '0.8rem' }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-slate-200">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div
                      className="absolute right-0 top-12 z-20 w-56 rounded-2xl overflow-hidden animate-fade-down"
                      style={{
                        background: 'rgba(11,18,31,0.97)',
                        border: '1px solid rgba(31,45,66,0.9)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)',
                        backdropFilter: 'blur(20px)',
                      }}
                    >
                      {/* User Info */}
                      <div
                        className="px-4 py-3.5"
                        style={{ borderBottom: '1px solid rgba(31,45,66,0.7)' }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="avatar-md">
                            {user?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                            <p className="text-2xs text-slate-500 truncate">{user?.email}</p>
                            <span className="badge-primary mt-1 inline-flex capitalize">{user?.role}</span>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-1.5">
                        <Link
                          to="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <LayoutDashboard size={15} className="text-primary-400" />
                          My Dashboard
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-amber-300/80 hover:text-amber-200 hover:bg-amber-500/8 transition-all"
                          >
                            <Shield size={15} className="text-amber-400" />
                            Admin Panel
                          </Link>
                        )}
                        <div
                          className="my-1"
                          style={{ height: '1px', background: 'rgba(31,45,66,0.6)' }}
                        />
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-red-400/80 hover:text-red-300 hover:bg-red-500/8 transition-all text-left"
                        >
                          <LogOut size={15} /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm">Get Started</Link>
              </div>
            )}

            {/* ── Mobile Hamburger ── */}
            <button
              className="md:hidden btn-icon ml-1"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {menuOpen && (
          <div
            className="md:hidden py-3 animate-fade-down"
            style={{ borderTop: '1px solid rgba(31,45,66,0.6)' }}
          >
            <div className="flex flex-col gap-0.5 mb-3">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary-600/15 text-primary-300 border border-primary-700/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/4'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
            {!isAuthenticated && (
              <div className="flex gap-2 pt-2" style={{ borderTop: '1px solid rgba(31,45,66,0.5)' }}>
                <Link to="/login" className="flex-1 btn-secondary text-center text-sm py-2.5"
                  onClick={() => setMenuOpen(false)}>
                  Sign In
                </Link>
                <Link to="/register" className="flex-1 btn-primary text-center text-sm py-2.5"
                  onClick={() => setMenuOpen(false)}>
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
