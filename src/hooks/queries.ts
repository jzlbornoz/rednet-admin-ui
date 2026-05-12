import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import type { Conversation, Message, MessagesResponse } from '@/types/api';
import { toast } from 'sonner';

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

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ phoneNumber, content }: { phoneNumber: string; content: string }) =>
      api.conversations.sendMessage(phoneNumber, content),
    onMutate: async ({ content }) => {
      await queryClient.cancelQueries({ queryKey: ['messages', conversationId] });
      const snapshot = queryClient.getQueryData<MessagesResponse>(['messages', conversationId, { limit: 50 }]);
      const tempMessage: Message = {
        id: crypto.randomUUID(),
        direction: 'OUTBOUND',
        type: 'TEXT',
        content,
        mediaUrl: null,
        status: 'SENT',
        createdAt: new Date().toISOString(),
      };
      queryClient.setQueryData(['messages', conversationId, { limit: 50 }], (old: MessagesResponse | undefined) => {
        if (!old) return old;
        return { ...old, messages: [...old.messages, tempMessage] };
      });
      return { snapshot };
    },
    onError: (_err: Error, _vars: { phoneNumber: string; content: string }, context: { snapshot: MessagesResponse | undefined } | undefined) => {
      if (context?.snapshot) {
        queryClient.setQueryData(['messages', conversationId, { limit: 50 }], context.snapshot);
      }
      toast.error('Failed to send message. Please try again.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
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