import { defineConfig, mergeConfig, type Plugin } from 'vite';
import baseConfig from '../vite.config';

// The dedicated Daybook development preview opens directly into Daybook.
// The ordinary Vite command and the original INTEVARIS routes are unchanged.
const daybookPreview: Plugin = {
  name: 'daybook-preview-entry',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/') {
        res.statusCode = 302;
        res.setHeader('Location', '/daybook');
        res.end();
        return;
      }
      next();
    });
  },
};

export default defineConfig(async (env) => mergeConfig(await baseConfig(env), { plugins: [daybookPreview] }));
