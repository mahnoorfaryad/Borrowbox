import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';

export default function Settings() {
  const { user, updateUserLocal, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', area: user.area || '' });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/users/me', form);
      updateUserLocal(res.data.data);
      showToast('Profile updated.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update profile.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await api.delete('/users/me');
      showToast('Account deactivated.');
      logout();
      navigate('/');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not delete account.', 'error');
    } finally {
      setConfirmDelete(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <h1 className="font-display font-bold text-2xl text-navy mb-6">Account settings</h1>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-500">Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500">Phone</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500">Area</label>
          <input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}
            className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" />
        </div>
        <button type="submit" disabled={saving}
          className="w-full py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-navy to-brand hover:opacity-90 transition shadow-soft disabled:opacity-50">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      <div className="mt-8 bg-rose-50 border border-rose-100 rounded-2xl p-6">
        <h3 className="font-display font-bold text-rose-600 mb-1">Danger zone</h3>
        <p className="text-sm text-rose-500 mb-4">Deleting your account is permanent. This is blocked while you have open bookings.</p>
        <button onClick={() => setConfirmDelete(true)} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600">
          Delete account
        </button>
      </div>

      <ConfirmModal
        open={confirmDelete}
        title="Delete your account?"
        message="This will deactivate your account permanently. This action cannot be undone."
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
