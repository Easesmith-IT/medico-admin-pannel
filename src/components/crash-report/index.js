export function InfoCard({ label, children }) {
  return (
    <div className="min-w-0 rounded-lg border bg-white p-4 dark:bg-[#111722]">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 break-all font-medium">{children}</div>
    </div>
  );
}

export function InfoBox({ title, children }) {
  return (
    <div className="min-w-0 rounded-lg border bg-white p-4 dark:bg-[#111722]">
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="break-all text-sm">{children}</p>
    </div>
  );
}

export function InfoRow({ label, children }) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-1">{label}</h3>
      <p className="text-sm break-all">{children}</p>
    </div>
  );
}
