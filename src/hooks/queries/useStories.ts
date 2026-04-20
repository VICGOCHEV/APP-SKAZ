import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getStories, markStorySeen } from '@/api/stories';
import { queryKeys } from './queryKeys';
import type { Story } from '@/types';

export function useStories() {
  return useQuery({
    queryKey: queryKeys.stories,
    queryFn: getStories,
  });
}

export function useMarkStorySeen() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markStorySeen,
    onSuccess: (_data, id) => {
      qc.setQueryData<Story[]>(queryKeys.stories, (prev) =>
        prev?.map((s) => (s.id === id ? { ...s, seen: true } : s)),
      );
    },
  });
}
