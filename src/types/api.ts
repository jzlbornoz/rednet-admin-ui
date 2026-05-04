export interface Admin {
  id: string;
  email: string;
  name: string;
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
  status: 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
  lastMessageAt: string;
  createdAt: string;
  user: User | null;
  lastMessage: { content: string; type: string; createdAt: string } | null;
  messages?: Message[];
}

export interface ConversationsResponse {
  conversations: Conversation[];
  total: number;
  page: number;
  limit: number;
}

export interface MessagesResponse {
  messages: Message[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface StatsResponse {
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  totalMessagesToday: number;
}