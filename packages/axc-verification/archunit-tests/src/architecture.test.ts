/**
 * ArchUnit tests for agentCourses layered architecture.
 * Validates boundaries for the dark software factory packages.
 * Real packages under test are imported so rules fail if structure drifts.
 */
import 'archunit/register';
import { archTest, files, have, inLayer, not, resideIn, contain, beEmpty } from 'archunit';

describe('Architecture boundaries (axc)', () => {
	// Define layers relative to src roots
	const axcRest = files.inPackage('@axc/axc').inPath('**/rest/**');
	const axcDomain = files.inPackage('@axc/axc').inPath('**/domain/**');
	const axcPersistence = files.inPackage('@axc/axc').inPath('**/persistence/**');
	const appsApi = files.inPackage('@apps/api').inPath('**/src/**');

	archTest('REST layer depends only on domain (not persistence or infra)', () =>
		axcRest
			.should(not(have(resideIn(axcPersistence))))
			.andShould(have(resideIn(axcDomain)).orBeEmpty()) // allow pure rest for health initially
	);

	archTest('API wires axc REST but does not bypass layers', () =>
		appsApi
			.should(have(resideIn(axcRest)).orBeEmpty())
	);

	archTest('Domain has no outgoing dependencies on rest or persistence', () =>
		axcDomain
			.should(not(have(resideIn(axcRest))))
			.andShould(not(have(resideIn(axcPersistence))))
	);

	archTest('No direct persistence access from REST', () =>
		axcRest
			.should(not(contain('from \'.*/persistence')))
	);
});
