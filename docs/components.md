# Components

## Stack

- Tailwind CSS → styling system
- shadcn/ui → base UI components library
- React Testing Library → component testing framework

All UI code is inside `src/app/renderer`.

## Adding shadcn Components

To install a new shadcn component, open a terminal and run the command shown on the [shadcn](https://ui.shadcn.com/docs/components) components website.
Example:

```sh
npx shadcn@latest add button
```

Configuration for shadcn is stored in `components.json` at the project root.

## Folder Structure

| Type                       | Path                                    | Description                                |
| -------------------------- | --------------------------------------- | ------------------------------------------ |
| Custom global components   | src/app/renderer/components             | Components built specifically for this app |
| shadcn components          | src/app/renderer/shadcn/components/ui   | Components installed via shadcn-ui add     |
| Custom specific components | src/app/renderer/pages/**/**/components | Components specific to a page or feature   |

### Rules:

- Never mix shadcn and custom components in the same folder.
- When wrapping or extending a shadcn component, create it under `src/app/renderer/components/`.

## Testing

Every custom component must include a test file with React Testing Library.
See `docs/tests.md` for setup, examples, and naming conventions.
Test file should follow the same relative path, e.g.:

```sh
src/app/renderer/components/Button/Button.tsx
src/app/renderer/components/Button/Button.test.tsx
src/app/renderer/components/Button/Button.css
```

## Guidelines

1. Always place generated components inside the correct folder based on type.
2. Use Tailwind or styled-components for styling — never inline CSS.
3. When referencing a UI element, prefer importing an existing shadcn component.
4. If a new UI pattern is introduced, document it in this file.
5. Add test for custom components with react-testing-library.
