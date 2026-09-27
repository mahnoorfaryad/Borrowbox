export default function StarRating({ value = 0, count, size = 'text-sm' }) {
  const rounded = Math.round(Number(value) * 2) / 2;
  return (
    <span className={`inline-flex items-center gap-1 ${size} text-amber-500 font-semibold`}>
      <span>★</span>
      <span>{Number(value).toFixed(1)}</span>
      {count !== undefined && <span className="text-slate-400 font-normal">({count})</span>}
    </span>
  );
}
