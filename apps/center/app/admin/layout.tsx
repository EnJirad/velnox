import { AdminLayout } from '@/components/layout/admin-layout';
import { AdminGuard } from '@/components/providers/admin-guard';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminGuard>
  );
}
