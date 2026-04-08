'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ManagerDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the manager dashboard main page
    router.replace('/dashboard/manager');
  }, [router]);

  return null;
}
