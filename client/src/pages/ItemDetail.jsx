import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Spinner from '../components/Spinner.jsx';
import CategoryIcon from '../components/CategoryIcon.jsx';
import StarRating from '../components/StarRating.jsx';
import BookingForm from '../components/BookingForm.jsx';

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [itemRes, availRes] = await Promise.all([
        api.get(`/items/${id}`),
        api.get(`/items/${id}/availability`),
      ]);
      setItem(itemRes.data.data);
      setAvailability(availRes.data.data);
    } catch (err) {
      showToast('Item not found.', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleRequest(payload) {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/items/${id}` } } });
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/bookings', { item_id: Number(id), ...payload });
      showToast('Borrow request sent to the owner!');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not send the request.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="py-24"><Spinner /></div>;
  if (!item) return null;

  const isOwner = user?.id === item.owner_id;
  let disabledReason = null;
  if (isOwner) disabledReason = 'This is your item — edit it from “My Items” instead.';
  else if (!user) disabledReason = null; // form still shown; will redirect to login on submit

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <p className="text-sm text-slate-400 mb-5">
        <Link to="/" className="hover:text-brand">Browse</Link> / <span className="text-slate-500">{item.category_name}</span> / <span className="text-navy font-medium">{item.title}</span>
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
        <div>
          <div className="h-72 sm:h-96 rounded-2xl bg-gradient-to-br from-navy to-brand flex items-center justify-center shadow-card relative overflow-hidden">
            <CategoryIcon name={item.category_name} className="text-8xl drop-shadow" />
            <span className="absolute top-4 right-4 bg-white/90 text-emerald-600 text-xs font-bold px-3 py-1.5 rounded-full">
              {item.is_active ? 'Available for booking' : 'Currently inactive'}
            </span>
          </div>

          <div className="flex gap-2 mt-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-16 w-16 rounded-xl bg-gradient-to-br from-navy/80 to-brand/80 flex items-center justify-center opacity-70">
                <CategoryIcon name={item.category_name} className="text-2xl" />
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="bg-brand/10 text-brand text-xs font-semibold px-3 py-1 rounded-full">{item.category_name}</span>
            <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full capitalize">Condition: {item.condition}</span>
            <span className="bg-indigo/10 text-indigo text-xs font-semibold px-3 py-1 rounded-full">Max {item.max_days} days</span>
          </div>

          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-navy mt-4">{item.title}</h1>
          <p className="text-slate-600 mt-3 leading-relaxed">{item.description || 'No description provided.'}</p>

          <div className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-card p-5 flex items-center gap-4">
            <span className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo to-brand text-white flex items-center justify-center font-bold">
              {item.owner_name?.[0]}
            </span>
            <div className="flex-1">
              <p className="font-semibold text-navy">{item.owner_name}</p>
              <p className="text-xs text-slate-400">Item owner · Pickup area: {item.pickup_area || item.owner_area || 'Not specified'}</p>
              <div className="mt-1"><StarRating value={item.owner_rating} count={item.owner_review_count} /></div>
            </div>
            <Link to={`/profile/${item.owner_id}`} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-navy hover:bg-slate-50 transition">
              View profile
            </Link>
          </div>
        </div>

        <div>
          <BookingForm
            item={item}
            bookedRanges={availability}
            onSubmit={handleRequest}
            submitting={submitting}
            disabledReason={disabledReason}
          />
        </div>
      </div>
    </div>
  );
}
