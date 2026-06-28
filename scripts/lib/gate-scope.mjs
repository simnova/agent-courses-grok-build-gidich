/**
 * Gate scope for verify orchestrator.
 * Exports TURBO_FILTER limited to gate-required packages only.
 * Used by scripts/verify.mjs and any direct turbo invocations in evidence capture.
 */
export const TURBO_FILTER = '@apps/api|@axc/*|@axc-verification/*';
export const TURBO_FILTER_ARGS = `--filter=${TURBO_FILTER}`;
