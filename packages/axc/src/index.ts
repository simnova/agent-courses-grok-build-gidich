/**
 * @axc/axc root
 * Core logic package for agentCourses dark software factory.
 * Provides extension points for experiment/run/model metrics (see subdirs).
 */
export * from './rest/index.js';
// domain and services are stubbed for initial scaffold (non-goal to populate full domain)
// reference stubs so they are not flagged as unused by knip
import './application-services/index.js';
import './persistence/index.js';
import './service-mongoose/index.js';
export const axcCoreVersion = '0.1.0';
