/**
 * @apps/api entrypoint.
 * Wires Hono + Azure Functions adapter for the agentCourses healthcheck.
 *
 * The healthcheck logic is implemented in the @axc/axc package (pure units)
 * so that:
 *  - archunit can validate layering (rest over domain)
 *  - serenity BDD steps import and invoke the real code directly
 *  - worktree runs exercise identical logic under WORKTREE_NAME
 *
 * Extension points documented in @axc/axc/rest/healthcheck.ts
 */

import { healthRouter } from '@axc/axc/rest';
import { app as azureFunctionsApp } from '@azure/functions';
import { azureHonoHandler } from '@marplex/hono-azurefunc-adapter';
import { Hono } from 'hono';

// Root Hono app
const app = new Hono();

// Basic info
app.get('/', (c) =>
	c.json({
		name: 'agentCourses',
		code: 'axc',
		health: '/health',
		description: 'Dark software factory API scaffold',
	}),
);

// Mount the real healthcheck from axc package
app.route('/health', healthRouter);

// Export the Hono instance for direct testing / BDD / worktree verification
// (no network hop)
export const honoApp = app;

// Register Azure HTTP trigger (works in Functions runtime and emulator)
try {
	azureFunctionsApp.http('axcApi', {
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
		authLevel: 'anonymous',
		route: '{*proxy}',
		handler: azureHonoHandler(app.fetch),
	});
} catch {
	// Running outside Azure Functions context (tsx dev, vitest, direct import)
	// This is expected and intentional for isolated worktree + test usage.
}

// Start local HTTP server when PORT is set (used by portless dev and direct start)
// Use an IIFE so this module has no top-level await (important for test runners
// and consumers that import honoApp synchronously).
if (process.env.PORT) {
	(async () => {
		const { createServer } = await import('node:http');
		const server = createServer(async (req, res) => {
			try {
				const host = req.headers.host || 'localhost';
				const url = `http://${host}${req.url}`;
				const method = req.method || 'GET';

				const headers = new Headers();
				for (const [key, value] of Object.entries(req.headers)) {
					if (value) {
						headers.set(key, Array.isArray(value) ? value.join(', ') : String(value));
					}
				}

				let body: Uint8Array | undefined;
				if (['POST', 'PUT', 'PATCH'].includes(method)) {
					const chunks: Buffer[] = [];
					for await (const chunk of req) {
						chunks.push(Buffer.from(chunk));
					}
					body = Buffer.concat(chunks);
				}

				const request = new Request(url, { method, headers, body: body as BodyInit });
				const response = await app.fetch(request);

				res.statusCode = response.status;
				response.headers.forEach((value, key) => {
					res.setHeader(key, value);
				});

				if (response.body) {
					const reader = response.body.getReader();
					const pump = async () => {
						const { done, value } = await reader.read();
						if (done) {
							res.end();
							return;
						}
						res.write(Buffer.from(value));
						pump();
					};
					pump();
				} else {
					res.end();
				}
			} catch (err) {
				console.error('Server error:', err);
				res.statusCode = 500;
				res.end('Internal Server Error');
			}
		});

		const port = Number(process.env.PORT);
		const host = process.env.HOST || '127.0.0.1';
		server.listen(port, host, () => {
			console.log(`Server listening on http://${host}:${port}`);
		});
	})();
}

export default app;
