import { createBrowserRouter, RouterProvider } from 'react-router';
import { HomePage } from './pages/home';

export function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      Component: HomePage,
    },
  ]);

  return <RouterProvider router={router} />;
}
