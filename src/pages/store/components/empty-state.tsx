export function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center gap-4 py-24 text-center">
      <span className="material-symbols-outlined text-6xl text-base-content/40">
        inventory_2
      </span>
      <h2 className="text-xl font-semibold">No products to display</h2>
      <p className="text-base-content/60 max-w-sm">
        There are no products available to display.
      </p>
    </div>
  );
}
