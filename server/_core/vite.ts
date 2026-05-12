import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(__dirname, "..", "..", "client", "index.html");

      // always reload the index.html file from disk in case it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      // Replace a clear marker token with the app entry script (more robust than string-replace)
      const appEntryToken = "<!-- APP_ENTRY -->";
      const entryScript = `\n    <script type="module" src="/src/main.tsx?v=${nanoid()}"></script>\n`;
      if (template.includes(appEntryToken)) {
        template = template.replace(appEntryToken, entryScript);
      } else {
        // Fallback to previous replace for compatibility
        template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${nanoid()}"`);
      }

      // Inject CSP nonce token
      const nonce = (res as any).locals?.cspNonce || '';
      template = template.replace(/<!-- CSP_NONCE -->/g, nonce);

      const page = await vite.transformIndexHtml(url, template);
      // Ensure CSP header includes the nonce (double-check)
      if (nonce) {
        res.setHeader('Content-Security-Policy', `default-src 'self'; script-src 'self' 'nonce-${nonce}'; connect-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data:; font-src 'self' https://fonts.gstatic.com`);
      }

      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(__dirname, "..", "..", "dist", "public")
      : path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", async (req, res) => {
    try {
      const indexPath = path.resolve(distPath, "index.html");
      let template = await fs.promises.readFile(indexPath, "utf-8");
      const nonce = (res as any).locals?.cspNonce || '';
      template = template.replace(/<!-- CSP_NONCE -->/g, nonce);

      if (nonce) {
        res.setHeader('Content-Security-Policy', `default-src 'self'; script-src 'self' 'nonce-${nonce}'; connect-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data:; font-src 'self' https://fonts.gstatic.com`);
      }

      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      console.error('Error serving static index.html', e);
      res.status(500).send('Server error');
    }
  });
}
