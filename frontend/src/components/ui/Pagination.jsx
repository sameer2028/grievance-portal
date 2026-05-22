/**
 * Props:
 *   pagination - { page, totalPages, hasNext, hasPrev }
 *   onPageChange - (newPage) => void
 */
const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, hasNext, hasPrev } = pagination;

  const pages = [];
  const delta = 1; // pages on each side of current
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
    pages.push(i);
  }

  const btnBase =
    'min-w-[2rem] h-8 px-2 rounded text-sm font-medium transition-colors focus-visible:outline';
  const btnActive = 'bg-primary-600 text-white';
  const btnInactive = 'text-gray-600 hover:bg-gray-100';
  const btnDisabled = 'text-gray-300 cursor-not-allowed';

  return (
    <div className="flex items-center justify-between py-4 px-1">
      <p className="text-xs text-gray-500">
        Page {page} of {totalPages}
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => hasPrev && onPageChange(page - 1)}
          disabled={!hasPrev}
          className={`${btnBase} ${hasPrev ? btnInactive : btnDisabled}`}
        >
          ‹
        </button>

        {pages[0] > 1 && (
          <>
            <button onClick={() => onPageChange(1)} className={`${btnBase} ${btnInactive}`}>1</button>
            {pages[0] > 2 && <span className="px-1 text-gray-400 text-sm">…</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`${btnBase} ${p === page ? btnActive : btnInactive}`}
          >
            {p}
          </button>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <span className="px-1 text-gray-400 text-sm">…</span>
            )}
            <button onClick={() => onPageChange(totalPages)} className={`${btnBase} ${btnInactive}`}>
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => hasNext && onPageChange(page + 1)}
          disabled={!hasNext}
          className={`${btnBase} ${hasNext ? btnInactive : btnDisabled}`}
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default Pagination;
