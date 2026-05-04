# AGENTS.md — @neo_bot/ui

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 (new engine) + shadcn/ui (radix-nova style)
- **State Management**: TanStack React Query v5
- **Routing**: React Router DOM v7
- **UI Components**: shadcn/ui (radix-nova, slate base, CSS variables)
- **Icons**: Lucide React
- **Fonts**: Geist Variable (@fontsource-variable/geist)

## Project Structure

```
ui/
├── .gitignore
├── components.json           # shadcn/ui config
├── eslint.config.js
├── index.html
├── package.json
├── public/
├── tailwind.config.js
├── tsconfig.json          # extends ../tsconfig.base.json
├── tsconfig.app.json      # target es2023, jsx react-jsx, paths @/* -> ./src/*
├── tsconfig.node.json
├── vite.config.ts         # plugins: react, tailwindcss, alias @ -> ./src, port 5173
├── src/
│   ├── App.tsx         # Main router configuration
│   ├── main.tsx        # Entry point
│   ├── index.css       # Global styles with Tailwind
│   ├── api/
│   │   └── client.ts   # API client (axios/fetch wrapper)
│   ├── auth/
│   │   ├── authContext.ts
│   │   ├── AuthProvider.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── useAuth.ts
│   ├── components/
│   │   ├── Layout.tsx
│   │   └── ui/           # shadcn/ui components (Button, Dialog, etc.)
│   ├── hooks/
│   │   └── queries.ts     # TanStack React Query hooks
│   ├── lib/
│   │   └── utils.ts       # cn() helper for class merging
│   ├── pages/
│   │   ├── ConversationDetailPage.tsx
│   │   ├── ConversationsPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── LoginPage.tsx
│   └── types/
│       └── api.ts         # API response types
```

## Code Conventions

### TypeScript

- **Strict mode** (noUnusedLocals, noUnusedParameters in tsconfig.app.json)
- **JSX**: react-jsx (React 19)
- **Module Resolution**: bundler
- **Path Aliases**: `@/*` maps to `./src/*` — always use these (e.g., `@/components/ui/button`)
- Explicit typing on all function parameters — no `any`

### Component Style

- **Functional Components** with hooks — never class components
- **Naming**: PascalCase `.tsx` files for components, PascalCase for page components
- **Events**: camelCase onClick, onSubmit, etc.

### Styling

- **Tailwind CSS v4** — uses `@import "tailwindcss"` in CSS, not @tailwind directives
- **shadcn/ui** — always prefer existing components over custom ones
- **CSS Variables**: shadcn/ui configured with `cssVariables: true` — use semantic tokens
- **Class Merging**: Use `cn()` from `@/lib/utils` to merge class names

### State Management

- **Server State**: TanStack React Query v5 — hooks in `src/hooks/queries.ts`
- **Client State**: React Context — auth in `src/auth/authContext.ts`

### Naming

- **Files**: PascalCase for components/pages, camelCase for hooks/utils
- **Directories**: kebab-case (hooks/, components/, pages/)
- **Classes**: PascalCase
- **Functions**: camelCase

## Useful Commands

```bash
# Development
npm run dev              # Start Vite dev server (port 5173)

# Build
npm run build             # TypeScript + Vite build
npm run lint             # ESLint
npm run preview          # Preview production build

# shadcn/ui
npx shadcn@latest add [component]  # Add new shadcn component
```

## Contribution Rules

1. **Use shadcn/ui components** — don't reinvent common UI patterns
2. **Add new pages to App.tsx** ��� register all routes in the router
3. **API calls through client.ts** — don't use raw fetch/axios elsewhere
4. **Server state via React Query** — hooks in `queries.ts`, not useEffect
5. **Strict TypeScript** — no `any`, full typing
6. **All new code should have tests** — Vitest for critical UI logic

## Recognized Patterns

### Page Pattern

```typescript
// src/pages/DashboardPage.tsx
import { useQuery } from '@/hooks/queries';

export function DashboardPage() {
  const { data, isLoading } = useDashboardData();
  
  if (isLoading) return <Loading />;
  
  return <div>{data?.items.map(item => <Item key={item.id} item={item} />)}</div>;
}
```

### API Hook Pattern

```typescript
// src/hooks/queries.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { client } from '@/api/client';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => client.get('/api/users'),
  });
}
```

### Auth Pattern

```typescript
// Usage in components
import { useAuth } from '@/auth/useAuth';

function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return <div>Welcome {user?.name}</div>;
}
```

### Protected Route Pattern

```typescript
// src/auth/ProtectedRoute.tsx
import { useAuth } from './useAuth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return children;
}
```

## Technical Notes

- **Dev Server Proxy**: Vite proxies `/api` to `http://localhost:3000` (the API package)
- **shadcn/ui Style**: radix-nova, slate base color, CSS variables enabled
- **Add Components**: Run `npx shadcn@latest add button` to add new components
- **Auth Flow**: JWT tokens, stored in localStorage, sent via Authorization header
- **TanStack Query**: v5 — uses queryKey for cache invalidation
- **Routing**: React Router DOM v7 with lazy loading for pages
- **Build Output**: `dist/` directory for production deployment