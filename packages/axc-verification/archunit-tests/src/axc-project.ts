/**
 * Centralized archunit project definition for @axc/axc layers.
 * Uses the package's tsconfig so projectFiles discovers actual .ts sources in src/.
 * Provides helpers for layer boundaries (rest/domain/persistence) and preflight assert.
 */
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projectFiles } from 'archunit';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '../../../../');

const AXC_TS_CONFIG = resolve(repoRoot, 'packages/axc/tsconfig.json');

/** ProjectFiles builder bound to the axc tsconfig (ensures files are found). */
export const axcFiles = () => projectFiles(AXC_TS_CONFIG);

/** Preflight: assert the project resolves files for src/ and each layer. Also exercises the shouldNot depend boundary rules during preflight so they are not only in test its. Throws on Empty or violations. */
export async function assertLayersResolve(): Promise<void> {
	const folders = ['src', 'src/rest', 'src/domain', 'src/persistence'];
	for (const f of folders) {
		const v = await axcFiles().inFolder(f).should().haveNoCycles().check();
		const hasEmpty = v.some(
			(vi: any) => (vi.message || '').includes('No files found') || (vi.message || '').includes('Empty'),
		);
		if (hasEmpty) {
			throw new Error(`axc-project: ${f} matched 0 files (EmptyTestViolation). Fix glob or tsconfig.`);
		}
	}
	// Exercise the actual boundary shouldNot depend rules in preflight (per skeptic)
	const restNoPers = await axcFiles()
		.inFolder('src/rest')
		.shouldNot()
		.dependOnFiles()
		.inFolder('src/persistence')
		.check();
	if (
		restNoPers.some((vi: any) => (vi.message || '').includes('No files') || (vi.message || '').includes('Empty')) ||
		restNoPers.length > 0
	) {
		throw new Error('axc-project preflight: rest shouldNot depend on persistence failed or no files matched');
	}
	const persNoRest = await axcFiles()
		.inFolder('src/persistence')
		.shouldNot()
		.dependOnFiles()
		.inFolder('src/rest')
		.check();
	if (
		persNoRest.some((vi: any) => (vi.message || '').includes('No files') || (vi.message || '').includes('Empty')) ||
		persNoRest.length > 0
	) {
		throw new Error('axc-project preflight: persistence shouldNot depend on rest failed or no files matched');
	}
	const domNoRest = await axcFiles().inFolder('src/domain').shouldNot().dependOnFiles().inFolder('src/rest').check();
	const domNoPers = await axcFiles()
		.inFolder('src/domain')
		.shouldNot()
		.dependOnFiles()
		.inFolder('src/persistence')
		.check();
	const domVs = [...domNoRest, ...domNoPers];
	if (
		domVs.some((vi: any) => (vi.message || '').includes('No files') || (vi.message || '').includes('Empty')) ||
		domVs.length > 0
	) {
		throw new Error('axc-project preflight: domain shouldNot depend on rest/persistence failed or no files matched');
	}
}
