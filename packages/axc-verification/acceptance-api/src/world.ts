/**
 * Serenity/JS World (minimal for agentCourses healthcheck BDD).
 * The step definitions import honoApp directly; this provides basic cast if needed.
 */

import { honoApp } from '@apps/api';
import { type Cast, engage } from '@serenity-js/core';

export class Actors implements Cast {
	prepare(actor: any): any {
		return actor;
	}
}

export const actors = new Actors();
engage(actors);

// Re-export hono for convenience in steps
export { honoApp };
