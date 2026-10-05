export type ViewMode = 'all' | 'photo' | 'plan';

export interface UsePhotoPlanReplaceMutationProps {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}
