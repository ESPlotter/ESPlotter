import { useMemo } from 'react';
import { createHashRouter, RouterProvider } from 'react-router';

import { useDataTableFormat } from './hooks/useDataTableFormat';
import { useOpenPreferencesOnRequest } from './hooks/useOpenPreferencesOnRequest';
import { HomePage } from './pages/home/page';
import { UserPreferencesPage } from './pages/preferences/page';

export type RouterType = ReturnType<typeof createHashRouter>;

export function App() {
  const router = useMemo(
    () =>
      createHashRouter([
        {
          path: '/',
          Component: HomePage,
        },
        {
          path: '/preferences',
          Component: UserPreferencesPage,
        },
      ]),
    [],
  );

  useOpenPreferencesOnRequest(router);
  useDataTableFormat();

  return <RouterProvider router={router} />;
}
