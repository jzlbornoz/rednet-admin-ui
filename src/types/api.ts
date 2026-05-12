export interface Admin {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

export interface User {
  id: string;
  name: string;
  cedula: string;
}

export interface Message {
  id: string;
  direction: 'INBOUND' | 'OUTBOUND';
  type: string;
  content: string;
  mediaUrl: string | null;
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  createdAt: string;
}

export interface Conversation {
  id: string;
  phoneNumber: string;
  contactName: string;
  status: 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ConversationsResponse {
  conversations: Conversation[];
  pagination: Pagination;
}

export interface MessagesResponse {
  messages: Message[];
  nextCursor?: string;
}

export interface StatsResponse {
  stats: {
    totalUsers: number;
    openTickets: number;
    pendingPayments: number;
    newProspects: number;
  };
}

export interface AdminStatsResponse {
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  totalMessagesToday: number;
}

export interface SendMessageResponse {
  wamid: string;
  messageId: string;
}