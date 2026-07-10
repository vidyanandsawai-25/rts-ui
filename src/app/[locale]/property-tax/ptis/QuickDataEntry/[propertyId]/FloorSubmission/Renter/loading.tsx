export default function RenterDetailsLoading() {
  return (
    <div className="flex min-h-[320px] w-full items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Loading renter screen...
        </span>
      </div>
    </div>
  );
}
