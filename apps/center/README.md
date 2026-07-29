# VelCenter

Velnox administration center (Next.js App Router).

## Foundation includes
- Admin layout with sidebar navigation
- `RoleGuard` component restricting `/admin/*` to ADMIN / SUPER_ADMIN
- Auth provider scaffold + API client wired to backend `/api`
- Route placeholders: `/admin/{users,merchants,shops,products,orders,reports,analytics,settings}`

## Development
\`\`\`bash
pnpm --filter center dev
\`\`\`
