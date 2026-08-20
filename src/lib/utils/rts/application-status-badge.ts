export type RtsApplicationStatusBadgeVariant =
  | 'success'
  | 'destructive'
  | 'warning'
  | 'secondary';

export interface RtsApplicationStatusBadgeProps {
  variant: RtsApplicationStatusBadgeVariant;
  className?: string;
}

/** Resolves overall application status styling for dashboard badges. */
export function getRtsApplicationStatusBadgeProps(
  status?: string | null
): RtsApplicationStatusBadgeProps {
  const normalized = status?.trim().toLowerCase() ?? '';

  if (
    normalized === 'approved' ||
    normalized === 'approve' ||
    normalized === 'application verified'
  ) {
    return { variant: 'success' };
  }

  if (normalized === 'rejected') return { variant: 'destructive' };
  if (normalized === 'reverted') {
    return {
      variant: 'secondary',
      className: 'border-orange-200 bg-orange-100 text-orange-800',
    };
  }
  if (normalized === 'document verified') return { variant: 'warning' };

  return { variant: 'secondary' };
}
