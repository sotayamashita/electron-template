import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Vitest options
    globals: true, // Use Vitest global APIs without imports
    environment: 'node', // Testing Node.js code (main process)
    // reporters: ['verbose'], // Optional: for more detailed output
  },
  resolve: {
    alias: {
      // Must match aliases in tsconfig.node.json and electron.vite.config.ts
      '#shared': resolve(__dirname, 'src/shared'),
      '@main': resolve(__dirname, 'src/main'),
      // Add other aliases if needed by tests
    },
  },
});
