export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white mt-20">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-navy to-brand text-white flex items-center justify-center font-display font-bold text-sm">B</span>
            <span className="font-display font-extrabold text-navy">BorrowBox</span>
          </div>
          <p className="text-sm text-slate-500 max-w-xs">
            The community way to lend and borrow tools and gadgets — clear dates, clear condition, clear trust.
          </p>
        </div>
        <div>
          <h4 className="font-display font-semibold text-navy text-sm mb-3">Platform</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li>Browse items</li>
            <li>List an item</li>
            <li>How it works</li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold text-navy text-sm mb-3">Trust & safety</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li>Condition check-in / out</li>
            <li>Two-way reviews</li>
            <li>Booking status tracking</li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold text-navy text-sm mb-3">Categories</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li>Power Tools</li>
            <li>Electronics</li>
            <li>Sports & Outdoor</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-5 text-center text-xs text-slate-400">
        Lend it. Borrow it. Track it. 📦
      </div>
    </footer>
  );
}
