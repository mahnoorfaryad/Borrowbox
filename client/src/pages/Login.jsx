import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      showToast('Welcome back!');
      navigate(location.state?.from?.pathname || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-gradient-to-br from-slate-50 to-brand/5">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-soft border border-slate-100 p-8 animate-fadeInUp">
        <div className="text-center mb-6">
          <span className="h-12 w-12 mx-auto rounded-xl bg-gradient-to-br from-navy to-brand text-white flex items-center justify-center font-display font-bold text-xl">B</span>
          <h1 className="font-display font-bold text-2xl text-navy mt-3">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-1">Log in to lend, borrow and track your items.</p>
        </div>

        {error && <div className="bg-rose-50 text-rose-600 text-sm rounded-lg px-3 py-2 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">Email</label>
            <input
              type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Password</label>
            <input
              type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-navy to-brand hover:opacity-90 transition shadow-soft disabled:opacity-50"
          >
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account? <Link to="/register" className="text-brand font-semibold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
