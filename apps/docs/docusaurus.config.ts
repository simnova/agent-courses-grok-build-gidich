import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
	title: 'agentCourses',
	tagline: 'Quantifying agentic coding harnesses and harness engineering',
	favicon: 'img/favicon.ico',
	url: 'https://axc.example.com',
	baseUrl: '/',
	organizationName: 'agentCourses',
	projectName: 'agentCourses',

	onBrokenLinks: 'throw',
	onBrokenMarkdownLinks: 'warn',

	presets: [
		[
			'classic',
			{
				docs: {
					sidebarPath: './sidebars.ts',
					editUrl: 'https://github.com/agentCourses/agentCourses/tree/main/apps/docs/',
				},
				blog: false,
				theme: {
					customCss: './src/css/custom.css',
				},
			} satisfies Preset.Options,
		],
	],

	themeConfig: {
		navbar: {
			title: 'agentCourses (axc)',
			items: [
				{ to: '/docs/intro', label: 'Docs', position: 'left' },
				{
					href: 'https://github.com/agentCourses/agentCourses',
					label: 'GitHub',
					position: 'right',
				},
			],
		},
		prism: {
			theme: prismThemes.github,
			darkTheme: prismThemes.dracula,
		},
	} satisfies Preset.ThemeConfig,
};

export default config;
