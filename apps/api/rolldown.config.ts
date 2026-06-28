/**
 * Minimal rolldown config for @apps/api.
 * Bundles the tsc output for Azure Functions deployment bundle.
 * Reimplements basic pattern from cellixjs inspiration (no direct copy).
 */
/// <reference types="node" />

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'rolldown';

const apiDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	input: 'dist/index.js',
	output: {
		dir: 'deploy',
		format: 'esm',
		entryFileNames: 'index.js',
		chunkFileNames: 'chunks/[name].js',
	},
	platform: 'node',
	external: [
		// Azure functions runtime and large native are external
		'@azure/functions',
		'mongoose',
	],
	// keep dynamic imports etc
});
