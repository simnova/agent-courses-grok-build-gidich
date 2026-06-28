// Cucumber.js config for Serenity/JS + Gherkin in agentCourses
// Runs acceptance features with direct invocation of shipped hono logic (no server required)
export default {
	default: {
		paths: ['src/features/**/*.feature'],
		require: ['src/step-definitions/**/*.steps.ts', 'src/world.ts'],
		requireModule: ['tsx'],
		format: ['@serenity-js/cucumber', 'progress-bar', 'rerun:@rerun.txt', 'json:target/reports/cucumber.json'],
		formatOptions: {
			'@serenity-js/cucumber': {
				theme: 'dark',
			},
		},
		publishQuiet: true,
	},
};
