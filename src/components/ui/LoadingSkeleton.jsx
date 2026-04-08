export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 animate-pulse">
      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl flex-shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"></div>
        <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded-lg w-1/2"></div>
      </div>
      <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 animate-pulse border border-gray-100 dark:border-gray-700">
      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl mb-3"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
    </div>
  );
}

export default function LoadingSkeleton({ rows = 5 }) {
  return (
    <div className="divide-y divide-gray-50 dark:divide-gray-700">
      {Array.from({ length: rows }).map((_, i) => <SkeletonRow key={i} />)}
    </div>
  );
}
