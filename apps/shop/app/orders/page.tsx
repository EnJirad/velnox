import { OrdersView } from './orders-view';
import { RequireAuth } from '@/components/require-auth';

export default function OrdersPage() {
  return (
    <RequireAuth>
      <OrdersView />
    </RequireAuth>
  );
}
