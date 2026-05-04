import { useStats } from '@/hooks/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Phone, BarChart3, Clock } from 'lucide-react';

const statCards = [
  { key: 'totalConversations' as const, label: 'Total Conversations', icon: Phone, color: 'text-blue-600 bg-blue-50' },
  { key: 'activeConversations' as const, label: 'Active Conversations', icon: MessageSquare, color: 'text-emerald-600 bg-emerald-50' },
  { key: 'totalMessages' as const, label: 'Total Messages', icon: BarChart3, color: 'text-violet-600 bg-violet-50' },
  { key: 'totalMessagesToday' as const, label: 'Messages Today', icon: Clock, color: 'text-amber-600 bg-amber-50' },
];

export default function DashboardPage() {
  const { data, isLoading } = useStats();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">Overview of your WhatsApp bot activity</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const value = data?.[card.key];
          const [iconColor, iconBg] = card.color.split(' ');
          return (
            <Card key={card.key}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <div className={`flex size-8 items-center justify-center rounded-lg ${iconBg}`}>
                  <Icon className={`size-4 ${iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoading ? '—' : value !== undefined ? value.toLocaleString() : '—'}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View and manage conversations to see message history and respond to users.
            </p>
            <a
              href="/conversations"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Go to Conversations →
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}