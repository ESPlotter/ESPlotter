import { createHashRouter, RouterProvider } from 'react-router';

import { UserPreferencesDialog } from '@renderer/components/UserPreferences/UserPreferencesDialog';
import { useUserPreferences } from '@renderer/hooks/useUserPreferences';

import { HomePage } from './pages/home';

export function App() {
  useUserPreferences();
  const router = createHashRouter([
    {
      path: '/',
      Component: HomePage,
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
      <UserPreferencesDialog />
    </>
  );
}
