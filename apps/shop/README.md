# VelShop

Customer marketplace application (Next.js App Router).

## Foundation includes
- App layout with Navigation, Language, Theme, and Auth providers
- API client (`lib/api-client.ts`) wired to the backend `/api` prefix
- Auth flow scaffold (`services/auth.service.ts`, `hooks/use-auth.ts`, `stores/auth-store.ts`)
- Route placeholders: `/products`, `/cart`, `/checkout`, `/orders`, `/profile`
- Feature-based folders under `features/` for future work

## Development
\`\`\`bash
pnpm --filter shop dev
\`\`\`
