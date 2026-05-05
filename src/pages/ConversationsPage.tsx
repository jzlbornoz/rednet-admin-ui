import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConversations } from '@/hooks/queries';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import type { Conversation } from '@/types/api';

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getStatusBadge(status: Conversation['status']) {
  const variants: Record<Conversation['status'], { label: string; className: string }> = {
    ACTIVE: { label: 'Active', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    CLOSED: { label: 'Closed', className: 'bg-slate-100 text-slate-600 border-slate-200' },
    ARCHIVED: { label: 'Archived', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  };
  const v = variants[status] ?? variants.ACTIVE;
  return (
    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${v.className}`}>
      {v.label}
    </Badge>
  );
}

const PAGE_SIZE = 20;

export default function ConversationsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  const debouncedSearch = search.length >= 2 ? search : undefined;

  const { data, isLoading } = useConversations({
    page,
    limit: PAGE_SIZE,
    status: statusFilter || undefined,
    search: debouncedSearch,
  });

  const totalPages = data ? Math.ceil(data?.pagination?.total / PAGE_SIZE) : 0;

  const conversations = data?.conversations ?? [];

  const displayName = (conv: Conversation) =>
    conv.contactName || conv.phoneNumber;

  return (
    <div className="flex h-screen flex-col">
      <div className="border-b bg-white px-4 py-3">
        <h1 className="text-lg font-semibold">Conversations</h1>
        <div className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by phone or name..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-8"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="CLOSED">Closed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          Loading conversations...
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
          <MessageSquare className="size-10" />
          <p>No conversations found</p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="divide-y">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => navigate(`/conversations/${conv.id}`)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600">
                  {displayName(conv).charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">
                      {displayName(conv)}
                    </span>
                    <div className="flex shrink-0 items-center gap-2">
                      {getStatusBadge(conv.status)}
                      <span className="text-xs text-muted-foreground">
                        {conv.updatedAt ? formatRelativeTime(conv.updatedAt) : ''}
                      </span>
                    </div>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    No messages yet
                  </p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-2">
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages} · {data?.pagination.total ?? 0} conversations
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="xs"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="size-3" />
            </Button>
            <Button
              variant="outline"
              size="xs"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight className="size-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}