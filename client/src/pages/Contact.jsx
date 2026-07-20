import { useState, useEffect } from 'react';
import { Mail, MessageSquare, MapPin, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { document.title = 'Contact — Digital Library'; }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    // Simulate form submission (replace with actual API call)
    await new Promise((r) => setTimeout(r, 1500));
    toast.success('Message sent! We\'ll get back to you within 24 hours.');
    setForm({ name: '', email: '', subject: '', message: '' });
    setLoading(false);
  };

  const contacts = [
    { icon: <Mail size={18} className="text-primary-400" />, label: 'Email', value: 'hello@digitallibrary.com' },
    { icon: <MessageSquare size={18} className="text-emerald-400" />, label: 'Response Time', value: 'Within 24 hours' },
    { icon: <MapPin size={18} className="text-violet-400" />, label: 'Location', value: 'India 🇮🇳' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-extrabold text-white mb-4">
          Get in <span className="gradient-text">Touch</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Have a question, feedback, or want to contribute? We'd love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="space-y-4">
          {contacts.map(({ icon, label, value }) => (
            <div key={label} className="glass-card p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-surface border border-surface-border flex items-center justify-center">
                {icon}
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">{label}</div>
                <div className="text-sm text-white font-medium mt-0.5">{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 glass-card p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Name <span className="text-red-400">*</span></label>
                <input type="text" placeholder="Your name" className="input-field" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email <span className="text-red-400">*</span></label>
                <input type="email" placeholder="you@example.com" className="input-field" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Subject</label>
              <input type="text" placeholder="What's this about?" className="input-field" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Message <span className="text-red-400">*</span></label>
              <textarea rows={5} placeholder="Tell us more..." className="input-field resize-none" value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-8 py-3">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
