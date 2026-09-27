import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext.jsx';
import Spinner from '../components/Spinner.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'users', label: 'Users' },
  { key: 'items', label: 'Items' },
  { key: 'categories', label: 'Categories' },
];

export default function Admin() {
  const { showToast } = useToast();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('');
  const [confirm, setConfirm] = useState(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [s, u, i, c] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/items'),
        api.get('/categories'),
      ]);
      setStats(s.data.data);
      setUsers(u.data.data);
      setItems(i.data.data);
      setCategories(c.data.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  async function toggleUser(id, is_active) {
    try {
      await api.patch(`/admin/users/${id}/status`, { is_active: !is_active });
      showToast('User status updated.');
      loadAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update user.', 'error');
    }
  }

  async function removeItem(id) {
    try {
      await api.delete(`/admin/items/${id}`);
      showToast('Item removed.');
      loadAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not remove item.', 'error');
    } finally {
      setConfirm(null);
    }
  }

  async function addCategory(e) {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      await api.post('/categories', { name: newCategory.trim() });
      setNewCategory('');
      showToast('Category added.');
      loadAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not add category.', 'error');
    }
  }

  async function deleteCategory(id) {
    try {
      await api.delete(`/categories/${id}`);
      showToast('Category deleted.');
      loadAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Category is in use.', 'error');
    } finally {
      setConfirm(null);
    }
  }

  if (loading) return <div className="py-24"><Spinner /></div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-display font-bold text-2xl text-navy mb-1">Admin Panel</h1>
      <p className="text-sm text-slate-500 mb-6">Platform-wide moderation and statistics.</p>

      <div className="flex gap-2 border-b border-slate-200 mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition shrink-0 ${tab === t.key ? 'border-brand text-brand' : 'border-transparent text-slate-500 hover:text-navy'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <StatCard label="Total users" value={stats.total_users} icon="👥" />
            <StatCard label="Total items" value={stats.total_items} icon="📦" />
            <StatCard label="Total bookings" value={stats.total_bookings} icon="🧾" />
          </div>
          <h3 className="font-display font-bold text-navy mb-3">Bookings by status</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {stats.bookings_by_status.map((s) => (
              <div key={s.status} className="bg-white rounded-xl border border-slate-100 p-4 text-center">
                <p className="text-2xl font-display font-bold text-navy">{s.count}</p>
                <p className="text-xs text-slate-400 mt-1">{s.status}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-navy">{u.name}</td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${u.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                      {u.is_active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleUser(u.id, u.is_active)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${u.is_active ? 'border border-rose-200 text-rose-500 hover:bg-rose-50' : 'border border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}>
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'items' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Owner</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-navy">{it.title}</td>
                  <td className="px-4 py-3 text-slate-500">{it.owner_name}</td>
                  <td className="px-4 py-3 text-slate-500">{it.category_name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${it.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                      {it.is_active ? 'Active' : 'Removed'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {it.is_active && (
                      <button onClick={() => setConfirm({ type: 'item', id: it.id, message: `Remove "${it.title}" from listings?` })}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-semibold text-rose-500 hover:bg-rose-50">
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'categories' && (
        <div className="max-w-lg">
          <form onSubmit={addCategory} className="flex gap-2 mb-5">
            <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New category name"
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" />
            <button type="submit" className="px-5 py-2.5 rounded-xl font-semibold text-white bg-brand hover:bg-navy transition text-sm">Add</button>
          </form>
          <div className="space-y-2">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between bg-white border border-slate-100 rounded-xl px-4 py-3">
                <span className="font-medium text-navy text-sm">{c.name}</span>
                <button onClick={() => setConfirm({ type: 'category', id: c.id, message: `Delete category "${c.name}"?` })}
                  className="text-xs font-semibold text-rose-500 hover:underline">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!confirm}
        title="Are you sure?"
        message={confirm?.message}
        onCancel={() => setConfirm(null)}
        onConfirm={() => (confirm?.type === 'item' ? removeItem(confirm.id) : deleteCategory(confirm.id))}
      />
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="font-display font-extrabold text-2xl text-navy">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  );
}
