import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <div className="text-6xl mb-4">📦</div>
      <h1 className="font-display font-bold text-3xl text-navy mb-2">Page not found</h1>
      <p className="text-slate-500 mb-6">This item might have been borrowed by someone else.</p>
      <Link to="/" className="px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-navy to-brand hover:opacity-90 transition shadow-soft">
        Back to Browse
      </Link>
    </div>
  );
}
