export function SidebarLoader() {
  return (
    <div className="space-y-3 px-2 py-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="skeleton-line h-10 w-full rounded-xl bg-white/15" />
      ))}
    </div>
  );
}
