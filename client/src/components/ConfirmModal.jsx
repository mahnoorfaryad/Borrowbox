export default function ConfirmModal({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel, danger = true }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-navy/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-soft max-w-sm w-full p-6 animate-fadeInUp">
        <h3 className="font-display font-bold text-lg text-navy mb-2">{title}</h3>
        <p className="text-slate-500 text-sm mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition ${danger ? 'bg-rose-500 hover:bg-rose-600' : 'bg-brand hover:bg-navy'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
