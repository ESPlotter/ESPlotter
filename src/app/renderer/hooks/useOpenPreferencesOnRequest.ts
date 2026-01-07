import { useEffect } from 'react';

import { RouterType } from '@renderer/app';

export function useOpenPreferencesOnRequest(router: RouterType): void {
  useEffect(() => {
    const unsubscribe = window.userPreferences.onOpenRequested(() => {
      router.navigate('/preferences');
    });

    return () => {
      unsubscribe();
    };
  }, [router]);
}
