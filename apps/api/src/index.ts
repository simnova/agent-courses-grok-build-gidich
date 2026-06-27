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
import { Hono } from 'hono';
import { azureHonoHandler } from '@marplex/hono-azurefunc-adapter';
import { app as azureFunctionsApp } from '@azure/functions';
import { healthRouter } from '@axc/axc/rest';

// Root Hono app
const app = new Hono();

// Basic info
app.get('/', (c) =>
	c.json({
		name: 'agentCourses',
		code: 'axc',
		health: '/health',
		description: 'Dark software factory API scaffold',
	})
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

export default app;
