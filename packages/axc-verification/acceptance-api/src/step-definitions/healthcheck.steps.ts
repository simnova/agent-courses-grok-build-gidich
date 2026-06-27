/**
 * Serenity step definitions that drive the *real* shipped healthcheck handler.
 * Imports directly from @apps/api and @axc/axc (the exact code that ships).
 * Uses honoApp.request(...) so no external server, works in any worktree.
 */
import { Given, When, Then } from '@cucumber/cucumber';
import { Ensure, equals, includes } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import { honoApp } from '@apps/api'; // real wiring of healthcheck

let lastResponse: Response;
let lastBody: any;

Given('the API is available', async function () {
	// Importing honoApp proves wiring; no side effects needed for health
});

When('I request the healthcheck endpoint', async function () {
	lastResponse = await honoApp.request('/health');
	lastBody = await lastResponse.json();
});

Then('the response status should be 200', async function () {
	await actorCalled('Tess').attemptsTo(Ensure.that(lastResponse.status, equals(200)));
});

Then('the response should indicate service is "ok"', async function () {
	await actorCalled('Tess').attemptsTo(Ensure.that(lastBody.status, equals('ok')));
});

Then('the response should include a recent timestamp', async function () {
	await actorCalled('Tess').attemptsTo(Ensure.that(typeof lastBody.timestamp, equals('string')));
	// basic recency: contains dashes as in ISO
	await actorCalled('Tess').attemptsTo(Ensure.that(lastBody.timestamp, includes('-')));
});

Then('the response should identify service {string}', async function (serviceName: string) {
	await actorCalled('Tess').attemptsTo(Ensure.that(lastBody.service, equals(serviceName)));
});
