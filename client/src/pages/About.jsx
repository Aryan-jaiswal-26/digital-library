import { BookOpen, Target, Users, Globe, Mail, Github, Twitter } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const values = [
  { icon: <BookOpen size={22} className="text-primary-400" />, title: 'Open Knowledge', desc: 'Believe every student deserves access to quality academic resources, regardless of background.' },
  { icon: <Target size={22} className="text-emerald-400" />, title: 'Academic Excellence', desc: 'Curated content focused on engineering curriculum from 1st to 4th year, plus reference material.' },
  { icon: <Users size={22} className="text-violet-400" />, title: 'Community Driven', desc: 'Built by students, for students. Faculty contribute notes, students share reviews.' },
  { icon: <Globe size={22} className="text-amber-400" />, title: 'Always Free', desc: 'Core library access will always be free. No paywalls for essential study material.' },
];

export default function About() {
  useEffect(() => { document.title = 'About — Digital Library'; }, []);
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
          <BookOpen size={36} className="text-white" />
        </div>
        <h1 className="text-4xl font-display font-extrabold text-white mb-4">
          About <span className="gradient-text">Digital Library</span>
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
          A free online platform built by Computer Engineering students to make academic resources
          accessible to everyone. Explore, read, and share knowledge.
        </p>
      </div>

      {/* Mission */}
      <div className="glass-card p-8 mb-10 text-center">
        <h2 className="text-xl font-display font-bold text-white mb-3">Our Mission</h2>
        <p className="text-slate-300 leading-relaxed">
          The Digital Library was born out of a simple frustration: engineering textbooks are expensive
          and scattered across the internet. We built a centralized, well-organized library where
          students can find exactly what they need — from 1st year mathematics to 4th year machine learning.
        </p>
      </div>

      {/* Values */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
        {values.map(({ icon, title, desc }) => (
          <div key={title} className="glass-card p-6 flex gap-4 hover:border-primary-700 transition-all duration-200">
            <div className="w-11 h-11 rounded-xl bg-surface border border-surface-border flex items-center justify-center shrink-0">
              {icon}
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center">
        <h2 className="text-2xl font-display font-bold text-white mb-3">Ready to start learning?</h2>
        <p className="text-slate-400 mb-6">Join hundreds of students already using the Digital Library.</p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/register" className="btn-primary px-8 py-3">Create Free Account</Link>
          <Link to="/books" className="btn-secondary px-8 py-3">Browse Books</Link>
        </div>
      </div>
    </div>
  );
}
