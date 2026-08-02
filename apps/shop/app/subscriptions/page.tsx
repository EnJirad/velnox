import { SubscriptionsView } from './subscriptions-view';
import { RequireAuth } from '@/components/require-auth';

export default function SubscriptionsPage() {
  return (
    <RequireAuth>
      <SubscriptionsView />
    </RequireAuth>
  );
}
