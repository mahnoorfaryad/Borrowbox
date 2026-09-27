import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import CategoryIcon from '../components/CategoryIcon.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';

const TABS = [
  { key: 'items', label: 'My Items' },
  { key: 'borrowings', label: 'My Borrowings' },
  { key: 'incoming', label: 'Incoming Requests' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState('items');
  const [items, setItems] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null); // { type, id, message }
  const [reviewFor, setReviewFor] = useState(null);
  const [conditionModal, setConditionModal] = useState(null); // { bookingId, action }

  async function loadAll() {
    setLoading(true);
    try {
      const [itemsRes, borrowRes, incomingRes] = await Promise.all([
        api.get('/items/mine'),
        api.get('/bookings/mine'),
        api.get('/bookings/incoming'),
      ]);
      setItems(itemsRes.data.data);
      setBorrowings(borrowRes.data.data);
      setIncoming(incomingRes.data.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  async function deleteItem(id) {
    try {
      const res = await api.delete(`/items/${id}`);
      showToast(res.data.message);
      loadAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not delete item.', 'error');
    } finally {
      setConfirm(null);
    }
  }

  async function deleteBooking(id) {
    try {
      await api.delete(`/bookings/${id}`);
      showToast('Booking removed.');
      loadAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not remove booking.', 'error');
    } finally {
      setConfirm(null);
    }
  }

  async function doAction(bookingId, action, extra = {}) {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { action, ...extra });
      showToast(`Booking ${action}d.`);
      loadAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed.', 'error');
    }
  }

  async function submitReview(bookingId, rating, comment) {
    try {
      await api.post(`/bookings/${bookingId}/reviews`, { rating, comment });
      showToast('Thanks for your review!');
      setReviewFor(null);
      loadAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not submit review.', 'error');
    }
  }

  if (loading) return <div className="py-24"><Spinner /></div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-navy">Welcome back, {user.name.split(' ')[0]} 👋</h1>
          <p className="text-sm text-slate-500">Manage what you lend, what you borrow, and requests coming your way.</p>
        </div>
        <Link to="/items/new" className="px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-navy to-brand hover:opacity-90 transition shadow-soft text-sm">
          + List an item
        </Link>
      </div>

      <div className="flex gap-2 border-b border-slate-200 mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition shrink-0 ${
              tab === t.key ? 'border-brand text-brand' : 'border-transparent text-slate-500 hover:text-navy'
            }`}
          >
            {t.label}
            {t.key === 'incoming' && incoming.filter((b) => b.status === 'REQUESTED').length > 0 && (
              <span className="ml-2 bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full">
                {incoming.filter((b) => b.status === 'REQUESTED').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'items' && (
        items.length === 0 ? (
          <EmptyState icon="📦" title="No items listed yet" subtitle="List your first tool or gadget for the community to borrow."
            action={<Link to="/items/new" className="px-5 py-2.5 rounded-xl font-semibold text-white bg-brand text-sm">List an item</Link>} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((it) => (
              <div key={it.id} className="bg-white rounded-2xl border border-slate-100 shadow-card p-4 flex gap-4">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-navy to-brand flex items-center justify-center shrink-0">
                  <CategoryIcon name={it.category_name} className="text-2xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/items/${it.id}`} className="font-semibold text-navy hover:text-brand truncate">{it.title}</Link>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${it.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                      {it.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{it.category_name} · {it.booking_count} booking(s)</p>
                  <div className="flex gap-2 mt-3">
                    <Link to={`/items/${it.id}/edit`} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-navy hover:bg-slate-50">Edit</Link>
                    <button
                      onClick={() => setConfirm({ type: 'item', id: it.id, message: `Delete "${it.title}"? This can't be undone.` })}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-semibold text-rose-500 hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'borrowings' && (
        borrowings.length === 0 ? (
          <EmptyState icon="🧾" title="No borrowings yet" subtitle="Browse the marketplace to send your first borrow request." />
        ) : (
          <div className="space-y-3">
            {borrowings.map((b) => (
              <BookingRow
                key={b.id}
                booking={b}
                perspective="borrower"
                title={b.item_title}
                counterpart={b.owner_name}
                onCancel={() => doAction(b.id, 'cancel')}
                onDelete={() => setConfirm({ type: 'booking', id: b.id, message: 'Remove this booking record?' })}
                onReview={() => setReviewFor(b)}
              />
            ))}
          </div>
        )
      )}

      {tab === 'incoming' && (
        incoming.length === 0 ? (
          <EmptyState icon="📥" title="No requests yet" subtitle="Once someone requests one of your items, it will show up here." />
        ) : (
          <div className="space-y-3">
            {incoming.map((b) => (
              <BookingRow
                key={b.id}
                booking={b}
                perspective="owner"
                title={b.item_title}
                counterpart={b.borrower_name}
                onApprove={() => doAction(b.id, 'approve')}
                onReject={() => doAction(b.id, 'reject')}
                onPickup={() => setConditionModal({ bookingId: b.id, action: 'pickup' })}
                onReturn={() => setConditionModal({ bookingId: b.id, action: 'return' })}
                onReview={() => setReviewFor(b)}
              />
            ))}
          </div>
        )
      )}

      <ConfirmModal
        open={!!confirm}
        title="Are you sure?"
        message={confirm?.message}
        onCancel={() => setConfirm(null)}
        onConfirm={() => (confirm?.type === 'item' ? deleteItem(confirm.id) : deleteBooking(confirm.id))}
      />

      {conditionModal && (
        <ConditionModal
          data={conditionModal}
          onClose={() => setConditionModal(null)}
          onSubmit={(note, condition) => {
            doAction(conditionModal.bookingId, conditionModal.action, { note, condition });
            setConditionModal(null);
          }}
        />
      )}

      {reviewFor && (
        <ReviewModal booking={reviewFor} onClose={() => setReviewFor(null)} onSubmit={submitReview} />
      )}
    </div>
  );
}

function BookingRow({ booking, perspective, title, counterpart, onCancel, onDelete, onApprove, onReject, onPickup, onReturn, onReview }) {
  const b = booking;
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link to={`/items/${b.item_id}`} className="font-semibold text-navy hover:text-brand">{title}</Link>
          <StatusBadge status={b.status} />
          {b.overdue && <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">Overdue</span>}
        </div>
        <p className="text-xs text-slate-400 mt-1">
          {perspective === 'borrower' ? `Owner: ${counterpart}` : `Borrower: ${counterpart}`} · {b.start_date} → {b.end_date}
        </p>
        {b.message && <p className="text-sm text-slate-500 mt-1 italic">"{b.message}"</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        {perspective === 'owner' && b.status === 'REQUESTED' && (
          <>
            <button onClick={onApprove} className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600">Approve</button>
            <button onClick={onReject} className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600">Reject</button>
          </>
        )}
        {perspective === 'owner' && b.status === 'APPROVED' && (
          <button onClick={onPickup} className="px-3 py-1.5 rounded-lg bg-indigo text-white text-xs font-semibold hover:opacity-90">Mark Picked Up</button>
        )}
        {perspective === 'owner' && b.status === 'PICKED_UP' && (
          <button onClick={onReturn} className="px-3 py-1.5 rounded-lg bg-teal text-white text-xs font-semibold hover:opacity-90">Mark Returned</button>
        )}
        {perspective === 'borrower' && ['REQUESTED', 'APPROVED'].includes(b.status) && (
          <button onClick={onCancel} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
        )}
        {['REJECTED', 'CANCELLED'].includes(b.status) && perspective === 'borrower' && (
          <button onClick={onDelete} className="px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-semibold text-rose-500 hover:bg-rose-50">Remove</button>
        )}
        {b.status === 'RETURNED' && (
          <button onClick={onReview} className="px-3 py-1.5 rounded-lg bg-amber-400 text-white text-xs font-semibold hover:bg-amber-500">★ Rate</button>
        )}
      </div>
    </div>
  );
}

function ConditionModal({ data, onClose, onSubmit }) {
  const [note, setNote] = useState('');
  const [condition, setCondition] = useState('good');
  const isPickup = data.action === 'pickup';
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-navy/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-soft max-w-sm w-full p-6 animate-fadeInUp">
        <h3 className="font-display font-bold text-lg text-navy mb-1">{isPickup ? 'Handover condition' : 'Return condition'}</h3>
        <p className="text-slate-500 text-sm mb-4">Log the item's condition — this becomes part of the permanent record.</p>
        <div className="mb-3">
          <label className="text-xs font-semibold text-slate-500">Condition</label>
          <select value={condition} onChange={(e) => setCondition(e.target.value)} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
            <option value="new">New</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="damaged">Damaged</option>
          </select>
        </div>
        <div className="mb-5">
          <label className="text-xs font-semibold text-slate-500">Note</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
            placeholder="e.g. one scratch on the handle" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
          <button onClick={() => onSubmit(note, condition)} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-brand hover:bg-navy">Confirm</button>
        </div>
      </div>
    </div>
  );
}

function ReviewModal({ booking, onClose, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-navy/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-soft max-w-sm w-full p-6 animate-fadeInUp">
        <h3 className="font-display font-bold text-lg text-navy mb-1">Rate this booking</h3>
        <p className="text-slate-500 text-sm mb-4">{booking.item_title}</p>
        <div className="flex gap-1 mb-4 text-2xl">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)} className={n <= rating ? 'text-amber-400' : 'text-slate-200'}>★</button>
          ))}
        </div>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
          placeholder="How was your experience?" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-5" />
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
          <button onClick={() => onSubmit(booking.id, rating, comment)} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-amber-400 hover:bg-amber-500">Submit review</button>
        </div>
      </div>
    </div>
  );
}
