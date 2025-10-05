import { createHashRouter, RouterProvider } from 'react-router';
import { HomePage } from './pages/home';

export function App() {
  const router = createHashRouter([
    {
      path: '/',
      Component: HomePage,
    },
  ]);

  return <RouterProvider router={router} />;
}
