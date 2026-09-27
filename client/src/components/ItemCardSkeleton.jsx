export default function ItemCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden border border-slate-100 animate-pulse">
      <div className="h-36 bg-slate-200" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-1/3 bg-slate-200 rounded" />
        <div className="h-4 w-3/4 bg-slate-200 rounded" />
        <div className="h-3 w-1/2 bg-slate-200 rounded" />
      </div>
    </div>
  );
}
