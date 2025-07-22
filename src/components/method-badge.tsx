import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { HttpMethod } from '@/lib/types';

interface MethodBadgeProps {
  method: HttpMethod;
  children: React.ReactNode;
}

const methodColors: Record<HttpMethod, string> = {
  get: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200/50',
  post: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200/50',
  put: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200/50',
  delete: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200/50',
  patch: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 border-orange-200/50',
  options: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200/50',
  head: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300 border-pink-200/50',
};

export function MethodBadge({ method, children }: MethodBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'font-mono text-xs',
        methodColors[method] || methodColors.get
      )}
    >
      {children}
    </Badge>
  );
}

    