import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, LogOut, Phone } from 'lucide-react';
import { useAuth } from '@/auth/useAuth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/conversations', label: 'Conversations', icon: MessageSquare },
];

export default function Layout() {
  const { admin, logout } = useAuth();
  const location = useLocation();

  const initials = admin?.name
    ? admin.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : admin?.email?.[0]?.toUpperCase() ?? 'A';

  return (
    <div className="flex h-screen bg-background">
      <aside className="flex w-64 flex-col bg-slate-900 text-white">
        <div className="flex h-14 items-center gap-2 px-4">
          <Phone className="size-5 text-emerald-400" />
          <span className="text-lg font-semibold tracking-tight">Neo Bot</span>
        </div>
        <Separator className="bg-slate-700" />
        <nav className="flex-1 space-y-1 px-2 py-3">
          {navItems.map((item) => {
            const isActive = item.href === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Separator className="bg-slate-700" />
        <div className="flex items-center gap-3 p-3">
          <Avatar size="sm">
            <AvatarFallback className="bg-slate-700 text-xs text-slate-300">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <div className="truncate text-sm font-medium">{admin?.name || admin?.email}</div>
            <div className="truncate text-xs text-slate-400">{admin?.email}</div>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-slate-400 hover:bg-slate-700 hover:text-white"
            onClick={logout}
            title="Sign out"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}