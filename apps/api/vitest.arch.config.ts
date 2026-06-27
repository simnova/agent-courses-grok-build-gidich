import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		include: ['src/archunit-tests/**/*.test.ts', 'src/**/*.arch.test.ts'],
	},
});
