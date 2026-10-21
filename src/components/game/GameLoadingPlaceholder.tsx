/** instant navigation / SSR 用：空 return を避ける */
export function GameLoadingPlaceholder({ label = "読み込み中…" }: { label?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
      {label}
    </div>
  );
}
