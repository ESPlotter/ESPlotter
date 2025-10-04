# Uniplot

## Requirements

- Node.js >= v22.12.0
- npm

## Setup

- Install dependencies:

```sh
npm install
```

- Install chromium for Playwright (test e2e):

```sh
npx playwright install chromium
```

- Make the Electron binary executable (only on Linux):

```sh
sudo chown root:root node_modules/electron/dist/chrome-sandbox
sudo chmod 4755 node_modules/electron/dist/chrome-sandbox
```

- Start the application in development mode:

```sh
npm start
```
