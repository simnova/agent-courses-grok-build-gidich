// Cucumber.js config for Serenity/JS + Gherkin in agentCourses
// Runs acceptance features with direct invocation of shipped hono logic (no server required)

import { ConsoleReporter } from '@serenity-js/console-reporter';
import { ArtifactArchiver, configure } from '@serenity-js/core';
import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';

// Configure Serenity reporters early (before features/steps are loaded)
// so that test outcomes are recorded for the HTML report.
configure({
	crew: [
		ConsoleReporter.withDefaultColourSupport(),
		ArtifactArchiver.fromJSON({ outputDirectory: 'target/site/serenity' }),
		SerenityBDDReporter.fromJSON({ specDirectory: 'src/features' }),
	],
});

export default {
	default: {
		paths: ['src/features/**/*.feature'],
		require: ['src/step-definitions/**/*.steps.ts', 'src/world.ts'],
		requireModule: ['tsx'],
		format: ['@serenity-js/cucumber', 'progress-bar', 'rerun:@rerun.txt'],
		formatOptions: {
			'@serenity-js/cucumber': {
				theme: 'dark',
			},
		},
		publishQuiet: true,
	},
};
