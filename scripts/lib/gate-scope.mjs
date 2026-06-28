/**
 * Gate scope for verify orchestrator.
 * Centralized list of gate-required packages (no docs, no cellix/*, no root).
 * Used for audit, snyk, e18e to ensure only gate pkgs are checked; prevents docs vulns or monorepo noise from swallowing.
 */
export const GATE_PACKAGES = [
	'@apps/api',
	'@axc/axc',
	'@axc/domain',
	'@axc-verification/acceptance-api',
	'@axc-verification/archunit-tests',
];

export const TURBO_FILTER_ARGS = `--filter=${GATE_PACKAGES.join('|')}`;

export function gatePackageJsonPaths() {
	// Map package names to their actual locations under the monorepo layout (packages/ + apps/)
	const pathMap = {
		'@apps/api': 'apps/api/package.json',
		'@axc/axc': 'packages/axc/package.json',
		'@axc/domain': 'packages/domain/package.json',
		'@axc-verification/acceptance-api': 'packages/axc-verification/acceptance-api/package.json',
		'@axc-verification/archunit-tests': 'packages/axc-verification/archunit-tests/package.json',
	};
	return GATE_PACKAGES.map((pkg) => pathMap[pkg] || `${pkg.replace(/^@/, '').replace(/\//g, '/')}/package.json`);
}
