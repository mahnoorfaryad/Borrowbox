import { useMemo, useState } from 'react';

function toISO(date) {
  return date.toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24)) + 1;
}

// Builds an array of booked ISO-date strings from ranges
function expandBookedDates(ranges) {
  const set = new Set();
  ranges.forEach((r) => {
    let cur = new Date(r.start_date);
    const end = new Date(r.end_date);
    while (cur <= end) {
      set.add(toISO(cur));
      cur.setDate(cur.getDate() + 1);
    }
  });
  return set;
}

export default function BookingForm({ item, bookedRanges = [], onSubmit, submitting, disabledReason }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [range, setRange] = useState({ start: null, end: null });
  const [message, setMessage] = useState('');

  const bookedSet = useMemo(() => expandBookedDates(bookedRanges), [bookedRanges]);
  const todayISO = toISO(today);

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const startWeekday = (firstDay.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function cellISO(day) {
    const dt = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return toISO(dt);
  }

  function isPast(iso) {
    return iso < todayISO;
  }

  function isSelected(iso) {
    if (!range.start) return false;
    if (!range.end) return iso === range.start;
    return iso >= range.start && iso <= range.end;
  }

  function handleClick(iso) {
    if (isPast(iso) || bookedSet.has(iso)) return;
    if (!range.start || (range.start && range.end)) {
      setRange({ start: iso, end: null });
    } else if (iso < range.start) {
      setRange({ start: iso, end: null });
    } else {
      // ensure no booked date within the span
      let cur = new Date(range.start);
      const end = new Date(iso);
      let clash = false;
      while (cur <= end) {
        if (bookedSet.has(toISO(cur))) clash = true;
        cur.setDate(cur.getDate() + 1);
      }
      if (clash) {
        setRange({ start: iso, end: null });
      } else {
        setRange({ start: range.start, end: iso });
      }
    }
  }

  const selectedDays = range.start && range.end ? daysBetween(range.start, range.end) : range.start ? 1 : 0;
  const exceedsMax = item?.max_days && selectedDays > item.max_days;
  const canSubmit = range.start && range.end && !exceedsMax && !submitting && !disabledReason;

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ start_date: range.start, end_date: range.end, message });
  }

  return (
    <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-5 sticky top-24">
      <h3 className="font-display font-bold text-navy text-lg mb-1">Request to borrow</h3>
      <p className="text-xs text-slate-400 mb-4">Owner approval required · max {item?.max_days} day(s)</p>

      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
          className="h-7 w-7 rounded-full hover:bg-slate-100 text-slate-500"
        >‹</button>
        <span className="font-semibold text-sm text-navy">{monthLabel}</span>
        <button
          type="button"
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
          className="h-7 w-7 rounded-full hover:bg-slate-100 text-slate-500"
        >›</button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-slate-400 mb-1">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 mb-3">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />;
          const iso = cellISO(day);
          const booked = bookedSet.has(iso);
          const past = isPast(iso);
          const selected = isSelected(iso);
          return (
            <button
              type="button"
              key={idx}
              disabled={booked || past}
              onClick={() => handleClick(iso)}
              className={`h-8 rounded-lg text-xs font-medium transition
                ${past ? 'text-slate-300 cursor-not-allowed' : ''}
                ${booked && !past ? 'bg-rose-100 text-rose-400 cursor-not-allowed line-through' : ''}
                ${selected ? 'bg-brand text-white shadow-sm' : ''}
                ${!booked && !past && !selected ? 'hover:bg-slate-100 text-slate-600' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-4">
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-rose-200"/> Booked</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-brand"/> Your dates</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-slate-200"/> Free</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-500">From</label>
            <div className="mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-navy bg-slate-50">
              {range.start || '—'}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">To</label>
            <div className="mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-navy bg-slate-50">
              {range.end || '—'}
            </div>
          </div>
        </div>

        {selectedDays > 0 && (
          <p className={`text-xs font-medium ${exceedsMax ? 'text-rose-500' : 'text-emerald-600'}`}>
            {exceedsMax ? `⚠️ Max ${item.max_days} day(s) allowed for this item` : `✓ ${selectedDays} day(s) selected (max ${item.max_days} allowed)`}
          </p>
        )}

        <div>
          <label className="text-xs font-semibold text-slate-500">Message to owner</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Let the owner know why you need it and when you'll return it..."
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>

        {disabledReason ? (
          <p className="text-sm text-center text-slate-500 bg-slate-50 rounded-lg py-2.5 font-medium">{disabledReason}</p>
        ) : (
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-navy to-brand disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition shadow-soft"
          >
            {submitting ? 'Sending…' : 'Send Request'}
          </button>
        )}
      </form>
    </div>
  );
}
