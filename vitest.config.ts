import { defineConfig } from 'vitest/config'
import path from 'path'
import fs from 'fs'

// Manually load env variables from .env.local for test environments
try {
  const envLocalPath = path.resolve(__dirname, '.env.local')
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf8')
    envContent.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const index = trimmed.indexOf('=')
        if (index !== -1) {
          const key = trimmed.substring(0, index).trim()
          let value = trimmed.substring(index + 1).trim()
          // Strip wrapping quotes
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.substring(1, value.length - 1)
          }
          if (key && !process.env[key]) {
            process.env[key] = value
          }
        }
      }
    })
  }
} catch (err) {
  console.warn('Failed to load .env.local in test config:', err)
}

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/*.spec.ts'],
    exclude: ['node_modules', '.next'],
    coverage: {
      reporter: ['text', 'json-summary'],
      include: ['src/lib/**', 'src/components/**'],
      exclude: ['src/**/*.test.*', 'src/**/*.spec.*'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
