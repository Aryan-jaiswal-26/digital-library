import { Link } from 'react-router-dom';
import { BookOpen, Github, Twitter, Mail, Heart, ArrowUpRight } from 'lucide-react';

const footerLinks = {
  Library: [
    { label: 'Browse All Books', to: '/books' },
    { label: '1st Year', to: '/books?category=1st+Year' },
    { label: '2nd Year', to: '/books?category=2nd+Year' },
    { label: '3rd Year', to: '/books?category=3rd+Year' },
    { label: '4th Year', to: '/books?category=4th+Year' },
  ],
  Account: [
    { label: 'Sign In', to: '/login' },
    { label: 'Create Account', to: '/register' },
    { label: 'Dashboard', to: '/dashboard' },
  ],
  Company: [
    { label: 'About Us', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 overflow-hidden">
      {/* Top gradient separator */}
      <div
        style={{
          height: '1px',
          background: 'linear-gradient(to right, transparent, rgba(99,102,241,0.3), rgba(124,58,237,0.2), transparent)',
        }}
      />

      {/* Glow orb */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-40 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center bottom, rgba(79,70,229,0.06) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />

      <div
        style={{
          background: 'rgba(8,14,26,0.95)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <Link to="/" className="inline-flex items-center gap-2.5 mb-5 group">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    boxShadow: '0 4px 16px rgba(79,70,229,0.4)',
                  }}
                >
                  <BookOpen size={20} className="text-white" />
                </div>
                <span className="font-display font-bold text-lg text-white tracking-tight">
                  Digital<span className="gradient-text">Library</span>
                </span>
              </Link>

              <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-6">
                Free online platform for Computer Engineering students to explore, read, and
                download academic resources. Built with ❤️ for knowledge.
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-2">
                {[
                  { href: 'mailto:hello@digitallibrary.com', icon: <Mail size={15} />, label: 'Email' },
                  { href: 'https://github.com', icon: <Github size={15} />, label: 'GitHub' },
                  { href: 'https://twitter.com', icon: <Twitter size={15} />, label: 'Twitter' },
                ].map(({ href, icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 transition-all duration-200 hover:text-white hover:-translate-y-0.5"
                    style={{
                      background: 'rgba(17,24,39,0.7)',
                      border: '1px solid rgba(31,45,66,0.8)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
                      e.currentTarget.style.background = 'rgba(79,70,229,0.12)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(79,70,229,0.2)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(31,45,66,0.8)';
                      e.currentTarget.style.background = 'rgba(17,24,39,0.7)';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Link Columns */}
            {Object.entries(footerLinks).map(([section, links]) => (
              <div key={section}>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
                  {section}
                </h4>
                <ul className="space-y-2.5">
                  {links.map(({ label, to }) => (
                    <li key={label}>
                      <Link
                        to={to}
                        className="group inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-primary-300"
                      >
                        {label}
                        <ArrowUpRight
                          size={11}
                          className="opacity-0 -translate-y-0.5 translate-x-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6"
            style={{ borderTop: '1px solid rgba(31,45,66,0.5)' }}
          >
            <p className="text-xs text-slate-500">
              &copy; {year} Digital Library. All rights reserved.
            </p>
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              Made with <Heart size={11} className="text-red-500 fill-red-500 animate-pulse" /> for engineering students
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
