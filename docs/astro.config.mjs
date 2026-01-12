// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://marvinnazari.github.io',
	base: '/intervals-icu-workout-parser',
	integrations: [
		starlight({
			title: 'Intervals.icu Workout Parser',
			description: 'Parse and build Intervals.icu workout text format',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/MarvinNazari/intervals-icu-workout-parser' },
				{ icon: 'npm', label: 'npm', href: 'https://www.npmjs.com/package/intervals-icu-workout-parser' },
			],
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Introduction', slug: 'getting-started/introduction' },
						{ label: 'Installation', slug: 'getting-started/installation' },
						{ label: 'Quick Start', slug: 'getting-started/quick-start' },
					],
				},
				{
					label: 'API Reference',
					items: [
						{ label: 'Parsing', slug: 'api/parsing' },
						{ label: 'Building', slug: 'api/building' },
						{ label: 'Types', slug: 'api/types' },
					],
				},
				{
					label: 'Format Specification',
					items: [
						{ label: 'Overview', slug: 'spec/overview' },
						{ label: 'Duration', slug: 'spec/duration' },
						{ label: 'Targets', slug: 'spec/targets' },
						{ label: 'Sections & Repeats', slug: 'spec/sections' },
					],
				},
				{
					label: 'Workout Catalog',
					items: [
						{ label: 'Overview', slug: 'catalog' },
						{ label: 'Cycling', slug: 'catalog/cycling' },
						{ label: 'Running', slug: 'catalog/running' },
						{ label: 'Swimming', slug: 'catalog/swimming' },
					],
				},
			],
			customCss: ['./src/styles/custom.css'],
		}),
	],
});
