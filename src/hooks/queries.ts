import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import type { Conversation } from '@/types/api';

export function useConversations(params?: { page?: number; limit?: number; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['conversations', params],
    queryFn: () => api.conversations.list(params),
    refetchInterval: 5000,
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: () => api.conversations.get(id),
    refetchInterval: 5000,
  });
}

export function useMessages(id: string, params?: { cursor?: string; limit?: number }) {
  return useQuery({
    queryKey: ['messages', id, params],
    queryFn: () => api.conversations.getMessages(id, params),
    refetchInterval: 5000,
  });
}

export function useUpdateConversationStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: string) => api.conversations.updateStatus(id, status),
    onMutate: async (newStatus) => {
      await queryClient.cancelQueries({ queryKey: ['conversation', id] });
      const previous = queryClient.getQueryData<{ conversation: Conversation }>(['conversation', id]);

      if (previous) {
        queryClient.setQueryData(['conversation', id], {
          conversation: { ...previous.conversation, status: newStatus as Conversation['status'] },
        });
      }

      return { previous };
    },
    onError: (_err, _newStatus, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['conversation', id], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => api.stats.get(),
    refetchInterval: 30000,
  });
}