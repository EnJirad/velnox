'use client';

import { Suspense } from 'react';
import { OrdersView } from './orders-view';
import { RequireAuth } from '@/components/require-auth';

export default function OrdersPage() {
  return (
    <RequireAuth>
      <Suspense
        fallback={
          <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-slate-500">
            กำลังโหลด...
          </div>
        }
      >
        <OrdersView />
      </Suspense>
    </RequireAuth>
  );
}
