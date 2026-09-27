import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', area: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      showToast('Account created — welcome to BorrowBox!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-gradient-to-br from-slate-50 to-brand/5">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-soft border border-slate-100 p-8 animate-fadeInUp">
        <div className="text-center mb-6">
          <span className="h-12 w-12 mx-auto rounded-xl bg-gradient-to-br from-navy to-brand text-white flex items-center justify-center font-display font-bold text-xl">B</span>
          <h1 className="font-display font-bold text-2xl text-navy mt-3">Create your account</h1>
          <p className="text-sm text-slate-500 mt-1">One account to both lend and borrow.</p>
        </div>

        {error && <div className="bg-rose-50 text-rose-600 text-sm rounded-lg px-3 py-2 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500">Full name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" placeholder="Ali Khan" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" placeholder="you@example.com" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" placeholder="03xx-xxxxxxx" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Area</label>
              <input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}
                className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" placeholder="Block B, DHA" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Password</label>
            <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" placeholder="At least 6 characters" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-navy to-brand hover:opacity-90 transition shadow-soft disabled:opacity-50 !mt-5">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account? <Link to="/login" className="text-brand font-semibold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
