import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConversation, useMessages, useUpdateConversationStatus, useSendMessage } from '@/hooks/queries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ChevronDown, ArrowLeft, User, Image, FileText, Check, CheckCheck, X, Send } from 'lucide-react';
import type { Conversation, Message } from '@/types/api';

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function StatusIcon({ status }: { status: Message['status'] }) {
  switch (status) {
    case 'SENT':
      return <Check className="size-3 text-muted-foreground" />;
    case 'DELIVERED':
      return <CheckCheck className="size-3 text-muted-foreground" />;
    case 'READ':
      return <CheckCheck className="size-3 text-blue-500" />;
    case 'FAILED':
      return <X className="size-3 text-red-500" />;
    default:
      return null;
  }
}

function getStatusBadge(status: Conversation['status']) {
  const variants: Record<Conversation['status'], { label: string; className: string }> = {
    ACTIVE: { label: 'Active', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    CLOSED: { label: 'Closed', className: 'bg-slate-100 text-slate-600 border-slate-200' },
    ARCHIVED: { label: 'Archived', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  };
  const v = variants[status] ?? variants.ACTIVE;
  return (
    <Badge variant="outline" className={`text-xs ${v.className}`}>
      {v.label}
    </Badge>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isInbound = message.direction === 'INBOUND';

  const isMedia = message.type === 'IMAGE' || message.type === 'VIDEO' || message.type === 'AUDIO' || message.type === 'DOCUMENT';
  const isInteractive = message.type === 'BUTTON' || message.type === 'LIST';

  return (
    <div className={`flex ${isInbound ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-3 py-2 ${
          isInbound
            ? 'bg-slate-100 text-slate-900 rounded-bl-sm'
            : 'bg-emerald-100 text-slate-900 rounded-br-sm'
        }`}
      >
        {isMedia && (
          <div className="mb-1 flex items-center gap-1.5 rounded-lg bg-white/60 p-2 text-xs text-slate-600">
            {message.type === 'IMAGE' && <Image className="size-3.5" />}
            {message.type === 'DOCUMENT' && <FileText className="size-3.5" />}
            {message.mediaUrl ? (
              <a href={message.mediaUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-900">
                {message.type.charAt(0) + message.type.slice(1).toLowerCase()}
              </a>
            ) : (
              <span>{message.type.charAt(0) + message.type.slice(1).toLowerCase()}</span>
            )}
          </div>
        )}
        {isInteractive && (
          <div className="mb-1 rounded-lg bg-white/60 p-1.5 text-xs font-medium text-slate-600">
            {message.content}
          </div>
        )}
        {(!isInteractive || isMedia) && message.content && !isMedia && (
          <p className="whitespace-pre-wrap text-sm">{message.content}</p>
        )}
        <div className={`mt-0.5 flex items-center gap-1 ${isInbound ? 'justify-start' : 'justify-end'}`}>
          <span className="text-[10px] text-muted-foreground">{formatTime(message.createdAt)}</span>
          {!isInbound && <StatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  );
}

function MessageInputBar({
  conversationStatus,
  onSend,
  isPending,
}: {
  phoneNumber: string;
  conversationStatus: Conversation['status'];
  onSend: (content: string) => void;
  isPending: boolean;
}) {
  const [inputValue, setInputValue] = useState('');

  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || inputValue.length > 4096 || isPending) return;
    onSend(trimmed);
    setInputValue('');
  }, [inputValue, isPending, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const isClosed = conversationStatus !== 'ACTIVE';
  const isDisabled = !inputValue.trim() || inputValue.length > 4096 || isPending;

  return (
    <div className="border-t bg-white px-4 py-3">
      {isClosed && (
        <div className="mb-2 rounded-md bg-amber-50 px-3 py-1.5 text-xs text-amber-700 border border-amber-200">
          Esta conversación está cerrada
        </div>
      )}
      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[40px] max-h-[120px] resize-none pr-2"
            rows={1}
          />
          {inputValue.length > 3500 && (
            <span
              className={`absolute bottom-1 right-2 text-[11px] ${
                inputValue.length > 4096 ? 'text-red-500 font-medium' : 'text-muted-foreground'
              }`}
            >
              {inputValue.length}/4096
            </span>
          )}
        </div>
        <Button size="icon" onClick={handleSend} disabled={isDisabled} className="shrink-0">
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export default function ConversationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const { data: convData, isLoading: convLoading } = useConversation(id ?? '');
  const { data: messagesData, isLoading: messagesLoading } = useMessages(id ?? '', { limit: 50 });
  const updateStatus = useUpdateConversationStatus(id ?? '');
  const sendMessage = useSendMessage(id ?? '');

  const conversation = convData?.conversation;
  const messages = useMemo(
    () => (messagesData?.messages ?? []).slice().sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [messagesData],
  );

  useEffect(() => {
    if (scrollRef.current && isAtBottom) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAtBottom]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setIsAtBottom(scrollHeight - scrollTop - clientHeight < 50);
  }, []);

  const displayName = conversation
    ? conversation.contactName || conversation.phoneNumber
    : '';

  const handleStatusChange = (status: string) => {
    updateStatus.mutate(status);
  };

  const handleSend = useCallback(
    (content: string) => {
      if (!conversation) return;
      sendMessage.mutate({ phoneNumber: conversation.phoneNumber, content });
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    },
    [conversation, sendMessage],
  );

  if (convLoading || messagesLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Loading conversation...
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 text-muted-foreground">
        <p>Conversation not found</p>
        <Button variant="outline" onClick={() => navigate('/conversations')}>
          Back to conversations
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center gap-3 border-b bg-white px-4 py-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/conversations')}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex size-9 items-center justify-center rounded-full bg-slate-100">
          <User className="size-4 text-slate-500" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold">{displayName}</h2>
          <p className="truncate text-xs text-muted-foreground">{conversation.phoneNumber}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              {getStatusBadge(conversation.status)}
              <ChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleStatusChange('ACTIVE')}>
              Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('CLOSED')}>
              Closed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('ARCHIVED')}>
              Archived
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto bg-slate-50 p-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No messages yet
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-2">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </div>
        )}
      </div>

      {conversation && (
        <MessageInputBar
          phoneNumber={conversation.phoneNumber}
          conversationStatus={conversation.status}
          onSend={handleSend}
          isPending={sendMessage.isPending}
        />
      )}
    </div>
  );
}