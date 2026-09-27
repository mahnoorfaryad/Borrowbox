import { Link } from 'react-router-dom';
import CategoryIcon from './CategoryIcon.jsx';
import StarRating from './StarRating.jsx';

const GRADIENTS = [
  'from-navy to-brand',
  'from-teal to-brand',
  'from-indigo to-navy',
  'from-brand to-teal',
  'from-indigo to-brand',
];

export default function ItemCard({ item, index = 0 }) {
  const gradient = GRADIENTS[index % GRADIENTS.length];
  return (
    <Link
      to={`/items/${item.id}`}
      className="group bg-white rounded-2xl shadow-card hover:shadow-soft hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-slate-100 flex flex-col"
    >
      <div className={`h-36 bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
        <CategoryIcon name={item.category_name} className="text-5xl drop-shadow-sm" />
        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-emerald-600 text-xs font-bold px-2.5 py-1 rounded-full">
          Available
        </span>
      </div>
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-brand font-semibold">{item.category_name}</span>
          <span className="text-slate-400">max {item.max_days}d</span>
        </div>
        <h3 className="font-display font-bold text-navy text-base leading-snug group-hover:text-brand transition-colors">
          {item.title}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <StarRating value={item.owner_rating} />
          <span className="text-xs text-slate-400 capitalize">{item.condition}</span>
        </div>
      </div>
    </Link>
  );
}
