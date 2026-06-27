import Layout from '@theme/Layout';
import type React from 'react';

export default function Home(): React.JSX.Element {
	return (
		<Layout
			title="agentCourses"
			description="Dark software factory for agentic development"
		>
			<main style={{ padding: '2rem' }}>
				<h1>agentCourses</h1>
				<p>
					Quantifying harness engineering, agentic coding harnesses, and model selection for software quality and
					delivery.
				</p>
				<p>Initial scaffold with healthcheck, worktree isolation, and full guardrails.</p>
			</main>
		</Layout>
	);
}
