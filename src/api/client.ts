import type { Admin, ConversationsResponse, Conversation, MessagesResponse, StatsResponse } from '@/types/api';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/admin` : `/api/admin`;

function getAuthToken(): string | null {
  return localStorage.getItem('admin_token');
}

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('admin_token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      apiRequest<{ token: string; admin: Admin }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    me: () =>
      apiRequest<{ admin: Admin }>('/auth/me'),
  },
  conversations: {
    list: (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.status) searchParams.set('status', params.status);
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString();
      return apiRequest<ConversationsResponse>(`/conversations${query ? `?${query}` : ''}`);
    },
    get: (id: string) =>
      apiRequest<{ conversation: Conversation }>(`/conversations/${id}`),
    getMessages: (id: string, params?: { cursor?: string; limit?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.cursor) searchParams.set('cursor', params.cursor);
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      const query = searchParams.toString();
      return apiRequest<MessagesResponse>(`/conversations/${id}/messages${query ? `?${query}` : ''}`);
    },
    updateStatus: (id: string, status: string) =>
      apiRequest<{ conversation: Conversation }>(`/conversations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },
  stats: {
    get: () =>
      apiRequest<StatsResponse>('/stats'),
  },
};