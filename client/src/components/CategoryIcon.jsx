const ICONS = {
  'Power Tools': '🛠️',
  'Home & Garden': '🪴',
  'Electronics': '🎧',
  'Kitchen': '🍳',
  'Sports & Outdoor': '⛺',
};

export default function CategoryIcon({ name, className = '' }) {
  return <span className={className}>{ICONS[name] || '📦'}</span>;
}
