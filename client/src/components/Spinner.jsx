export default function Spinner({ size = 'md' }) {
  const dim = size === 'sm' ? 'h-5 w-5 border-2' : 'h-10 w-10 border-4';
  return (
    <div className="flex justify-center items-center">
      <div className={`${dim} rounded-full border-brand/20 border-t-brand animate-spin`} />
    </div>
  );
}
