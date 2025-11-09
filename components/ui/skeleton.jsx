import { cn } from "@/lib/utils";

function Skeleton({ className = '', ...props }) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-zinc-100 animate-pulse rounded-md', className)}
      {...props}
    />
  );
}

function SkeletonLine({ width = 'w-full', height = 'h-4', className = '' }) {
  return (
    <div className={cn(width, height, 'bg-zinc-100 rounded', className)} />
  );
}

function SkeletonCard({ lines = 3 }) {
  return (
    <div className="border border-[#d4d4d4] bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-zinc-200" />
        <div className="flex-1 space-y-2">
          <div className="w-1/3 h-4 bg-zinc-200 rounded" />
          <div className="w-1/2 h-3 bg-zinc-200 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, idx) => (
          <div key={idx} className="w-full h-3 bg-zinc-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export { Skeleton, SkeletonLine, SkeletonCard };
