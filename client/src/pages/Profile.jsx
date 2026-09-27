import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StarRating from '../components/StarRating.jsx';
import ItemCard from '../components/ItemCard.jsx';

export default function Profile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/users/${id}`).then((res) => setData(res.data.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="py-24"><Spinner /></div>;
  if (!data) return <EmptyState icon="🙈" title="User not found" />;

  const { user, rating, reviews, items } = data;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
        <span className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo to-brand text-white flex items-center justify-center font-display font-bold text-2xl shrink-0">
          {user.name?.[0]}
        </span>
        <div className="flex-1">
          <h1 className="font-display font-bold text-2xl text-navy">{user.name}</h1>
          <p className="text-sm text-slate-500 mt-1">{user.area || 'Area not specified'} · Member since {new Date(user.created_at).getFullYear()}</p>
          <div className="mt-2 flex justify-center sm:justify-start">
            <StarRating value={rating.avg_rating} count={rating.review_count} size="text-base" />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-display font-bold text-lg text-navy mb-4">Items listed ({items.length})</h2>
        {items.length === 0 ? (
          <p className="text-sm text-slate-400">No active listings.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {items.map((it, idx) => <ItemCard key={it.id} item={{ ...it, category_name: '', owner_rating: rating.avg_rating }} index={idx} />)}
          </div>
        )}
      </div>

      <div className="mt-10">
        <h2 className="font-display font-bold text-lg text-navy mb-4">Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-slate-400">No reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white rounded-xl border border-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-navy text-sm">{r.reviewer_name}</p>
                  <span className="text-amber-500 text-sm font-semibold">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                </div>
                {r.comment && <p className="text-sm text-slate-500 mt-1">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
