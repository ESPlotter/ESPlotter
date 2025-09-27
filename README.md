# Uniplot

## Requirements
- Node.js >= v16.4.0
- npm

## Setup
- Install dependencies:
```sh
npm install
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