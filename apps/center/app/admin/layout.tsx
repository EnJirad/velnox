import { AdminLayout } from '@/components/layout/admin-layout';
import { RoleGuard } from '@/components/providers/role-guard';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={['ADMIN', 'SUPER_ADMIN']}>
      <AdminLayout>{children}</AdminLayout>
    </RoleGuard>
  );
}
