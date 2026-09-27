export default function EmptyState({ icon = '📦', title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-display font-bold text-lg text-navy mb-1">{title}</h3>
      {subtitle && <p className="text-slate-500 max-w-sm">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
