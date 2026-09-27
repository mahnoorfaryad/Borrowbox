const STYLES = {
  REQUESTED: 'bg-amber-100 text-amber-700 ring-amber-200',
  APPROVED: 'bg-sky-100 text-sky-700 ring-sky-200',
  PICKED_UP: 'bg-indigo-100 text-indigo-700 ring-indigo-200',
  RETURNED: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  REJECTED: 'bg-rose-100 text-rose-700 ring-rose-200',
  CANCELLED: 'bg-slate-200 text-slate-600 ring-slate-300',
};

const LABELS = {
  REQUESTED: 'Requested',
  APPROVED: 'Approved',
  PICKED_UP: 'Picked Up',
  RETURNED: 'Returned',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${STYLES[status] || 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
      {LABELS[status] || status}
    </span>
  );
}
