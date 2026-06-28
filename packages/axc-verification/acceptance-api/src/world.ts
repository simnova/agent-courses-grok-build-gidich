/**
 * Serenity/JS World (minimal for agentCourses healthcheck BDD).
 * The step definitions import honoApp directly; this provides basic cast if needed.
 */

import { honoApp } from '@apps/api';
import { ConsoleReporter } from '@serenity-js/console-reporter';
import { ArtifactArchiver, type Cast, configure, engage } from '@serenity-js/core';
import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';

configure({
	crew: [
		ConsoleReporter.withDefaultColourSupport(),
		ArtifactArchiver.fromJSON({ outputDirectory: 'target/site/serenity' }),
		SerenityBDDReporter.fromJSON({ specDirectory: 'src/features' }),
	],
});

export class Actors implements Cast {
	prepare(actor: any): any {
		return actor;
	}
}

export const actors = new Actors();
engage(actors);

// Re-export hono for convenience in steps
export { honoApp };
