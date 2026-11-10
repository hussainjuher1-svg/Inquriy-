import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins = [react(), tailwindcss()];
  try {
    // @ts-expect-error Optional plugin is injected only in some environments.
    const m = await import('./.vite-source-tags.js');
    plugins.push(m.sourceTags());
  } catch { /* Optional plugin is not present. */ }

  const env = loadEnv(mode, process.cwd(), ['VITE_', 'NEXT_PUBLIC_']);
  const processEnvDefines: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    processEnvDefines[`process.env.${key}`] = JSON.stringify(value);
  }

  return {
    plugins,
    server: { host: '0.0.0.0', allowedHosts: true as const, proxy: { '/api/daybook': 'http://127.0.0.1:3001' } },
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    define: processEnvDefines,
  };
})
