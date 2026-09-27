import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ItemCard from '../components/ItemCard.jsx';
import ItemCardSkeleton from '../components/ItemCardSkeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import CategoryIcon from '../components/CategoryIcon.jsx';

const STATS = [
  { label: 'Items listed', value: '250+' },
  { label: 'Community members', value: '600+' },
  { label: 'Successful borrows', value: '1,200+' },
  { label: 'Avg. trust score', value: '4.8★' },
];

export default function Home() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(params.get('search') || '');
  const [category, setCategory] = useState(params.get('category') || '');
  const [condition, setCondition] = useState('any');
  const [from, setFrom] = useState(params.get('from') || '');
  const [to, setTo] = useState(params.get('to') || '');
  const page = Number(params.get('page') || 1);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.data)).catch(() => {});
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const query = {};
      if (search) query.search = search;
      if (category) query.category = category;
      if (from) query.from = from;
      if (to) query.to = to;
      query.page = page;
      const res = await api.get('/items', { params: query });
      let data = res.data.data;
      if (condition !== 'any') data = data.filter((i) => i.condition === condition);
      setItems(data);
      setMeta(res.data.meta);
    } catch (err) {
      setItems([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, from, to, page, condition]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  function applyFilters(next = {}) {
    const nextParams = {
      search: next.search ?? search,
      category: next.category ?? category,
      from: next.from ?? from,
      to: next.to ?? to,
      page: 1,
    };
    Object.keys(nextParams).forEach((k) => (nextParams[k] === '' || nextParams[k] == null) && delete nextParams[k]);
    setParams(nextParams);
  }

  function goToPage(p) {
    setParams({ ...Object.fromEntries(params), page: p });
    window.scrollTo({ top: 400, behavior: 'smooth' });
  }

  function clearFilters() {
    setSearch(''); setCategory(''); setFrom(''); setTo(''); setCondition('any');
    setParams({});
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy to-brand">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-20 text-center">
          <span className="inline-block bg-white/10 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wide">
            📦 COMMUNITY TOOL & EQUIPMENT LENDING
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white leading-tight max-w-3xl mx-auto">
            Borrow what you need.<br className="hidden sm:block" /> Lend what you don't.
          </h1>
          <p className="text-white/70 mt-4 max-w-xl mx-auto">
            Drills, ladders, projectors, cameras and more — sitting idle nearby. Find it, request it, and get it with clear dates and zero guesswork.
          </p>

          <div className="mt-8 bg-white rounded-2xl shadow-soft p-3 max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-[1.5fr_1fr_1fr_auto] gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              placeholder="Search tools & gadgets..."
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" />
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" />
            <button onClick={() => applyFilters()} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-navy to-brand text-white font-semibold text-sm hover:opacity-90 transition">
              Search
            </button>
          </div>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="font-display font-extrabold text-white text-2xl">{s.value}</div>
                <div className="text-white/60 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category strip */}
      <section className="max-w-7xl mx-auto px-6 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-3 flex gap-2 overflow-x-auto">
          <button
            onClick={() => applyFilters({ category: '' })}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition ${!category ? 'bg-navy text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => applyFilters({ category: String(c.id) })}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                category === String(c.id) ? 'bg-navy text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CategoryIcon name={c.name} /> {c.name}
            </button>
          ))}
        </div>
      </section>

      {/* Listing */}
      <section className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        <aside className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-navy">Filters</h3>
              <button onClick={clearFilters} className="text-xs text-brand font-semibold hover:underline">Clear</button>
            </div>
            <div className="mb-5">
              <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Condition</p>
              <div className="space-y-1.5">
                {['any', 'new', 'good', 'fair'].map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                    <input type="radio" name="condition" checked={condition === c} onChange={() => setCondition(c)} className="accent-brand" />
                    <span className="capitalize">{c}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Sort by</p>
              <div className="text-sm text-slate-600 border border-slate-200 rounded-lg px-3 py-2">Newest first</div>
            </div>
          </div>
        </aside>

        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-navy text-lg">
              {loading ? 'Searching…' : `${meta.total} item${meta.total === 1 ? '' : 's'} found`}
            </h2>
            {(from && to) && <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-3 py-1 rounded-full">Free on {from} – {to}</span>}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <ItemCardSkeleton key={i} />)}
            </div>
          ) : items.length === 0 ? (
            <EmptyState icon="🔍" title="No items found" subtitle="Try clearing filters or searching a different keyword." />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {items.map((item, idx) => <ItemCard key={item.id} item={item} index={idx} />)}
              </div>
              {meta.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: meta.totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToPage(i + 1)}
                      className={`h-9 w-9 rounded-lg text-sm font-semibold transition ${page === i + 1 ? 'bg-navy text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
