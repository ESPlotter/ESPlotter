# Project Setup

## Routing in Electron

### Hash Router vs Browser Router

**Always use `createHashRouter` from `react-router` in Electron applications.**

#### Why?

- **Production (packaged)**: Electron loads files via `file://` protocol, which is incompatible with the browser's History API that `createBrowserRouter` relies on.
- **Development**: Works with both routers because Vite's dev server can handle route redirections.
- **Hash routing**: Uses URLs like `app.html#/page` where everything after `#` stays client-side and doesn't trigger server/file requests.

#### Example

```tsx
import { createHashRouter, RouterProvider } from 'react-router';

export function App() {
  const router = createHashRouter([
    {
      path: '/',
      Component: HomePage,
    },
    {
      path: '/about',
      Component: AboutPage,
    },
  ]);

  return <RouterProvider router={router} />;
}
```

#### Troubleshooting

If routes work in development (`npm run dev`) but fail in packaged app (`npm run make`):

- Check if you're using `createBrowserRouter` instead of `createHashRouter`
- Switch to `createHashRouter` to ensure compatibility with `file://` protocol
