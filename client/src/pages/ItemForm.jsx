import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';

const EMPTY = { title: '', description: '', category_id: '', condition: 'good', max_days: 3, pickup_area: '' };

export default function ItemForm({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/categories').then((res) => {
      setCategories(res.data.data);
      setForm((f) => ({ ...f, category_id: f.category_id || res.data.data[0]?.id || '' }));
    });
  }, []);

  useEffect(() => {
    if (mode !== 'edit') return;
    api.get(`/items/${id}`).then((res) => {
      const d = res.data.data;
      if (d.owner_id !== user?.id && user?.role !== 'admin') {
        showToast('You can only edit your own items.', 'error');
        navigate('/dashboard');
        return;
      }
      setForm({
        title: d.title, description: d.description, category_id: d.category_id,
        condition: d.condition, max_days: d.max_days, pickup_area: d.pickup_area || '',
      });
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, mode]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (mode === 'create') {
        await api.post('/items', form);
        showToast('Item listed successfully!');
      } else {
        await api.put(`/items/${id}`, form);
        showToast('Item updated.');
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="py-24"><Spinner /></div>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-display font-bold text-2xl text-navy mb-1">
        {mode === 'create' ? 'List a new item' : 'Edit item'}
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        Give clear details so borrowers know exactly what they're getting.
      </p>

      {error && <div className="bg-rose-50 text-rose-600 text-sm rounded-lg px-3 py-2 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-500">Title</label>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
            placeholder="e.g. Cordless Drill 18V" />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500">Description</label>
          <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
            placeholder="What's included, any special handling instructions..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">Category</label>
            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Condition</label>
            <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}
              className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40">
              <option value="new">New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">Max lending days</label>
            <input type="number" min={1} required value={form.max_days}
              onChange={(e) => setForm({ ...form, max_days: Number(e.target.value) })}
              className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Pickup area</label>
            <input value={form.pickup_area} onChange={(e) => setForm({ ...form, pickup_area: e.target.value })}
              className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              placeholder="e.g. Block B, DHA" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-navy to-brand hover:opacity-90 transition shadow-soft disabled:opacity-50">
            {saving ? 'Saving…' : mode === 'create' ? 'List item' : 'Save changes'}
          </button>
          <button type="button" onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
