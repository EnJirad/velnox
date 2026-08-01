import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { MerchantGuard } from '@/components/providers/merchant-guard';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <MerchantGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </MerchantGuard>
  );
}
