/**
 * Serenity/JS World for agentCourses acceptance.
 * Configures actors that can directly call the shipped API code (honoApp.request)
 * so that BDD validates the real implementation, including under WORKTREE_NAME.
 */
import { Actor, Cast, engage } from '@serenity-js/core';
import { CallAnApi } from '@serenity-js/rest';
import { honoApp } from '@apps/api'; // the shipped hono instance

// Custom ability to call the hono app directly via its .request (fetch-like)
export class CallHonoApp {
	static using(app: any = honoApp) {
		return new CallHonoApp(app);
	}
	constructor(public readonly app: any) {}

	// Proxy to hono request: app.request(path, init)
	async request(path: string, init?: RequestInit) {
		return this.app.request(path, init);
	}
}

export class Actors implements Cast {
	prepare(actor: Actor): Actor {
		return actor.whoCan(
			// REST ability using hono direct (avoids real http server for isolation)
			CallAnApi.using({
				baseURL: '', // relative
				// custom adapter? For simplicity use custom ability too
			}),
			CallHonoApp.using(honoApp)
		);
	}
}

export const actors = new Actors();

// Auto engage for cucumber/serenity
engage(actors);
