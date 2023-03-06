import fs from 'fs';
import path from 'path';
import { SitemapStream } from 'sitemap';
import { defineConfig } from 'vitepress';

const sideBar = [
	{
		text: 'Introduce',
		items: [
			{ text: '什么是 creta', link: '/guide/creta' },
			{ text: '快速开始', link: '/guide/quick-start' },
			{ text: '为什么选择 creta', link: '/guide/why-creta' },
			{ text: '配置 creta', link: '/guide/configs' },
			{ text: 'creta 的安全哲学', link: '/guide/safety-philosophy' },
		],
	},
	{
		text: 'Features',
		items: [
			{ text: '快速重载', link: '/feature/relaunch-electron' },
			{ text: '轻量更新', link: '/feature/lite-update' },
		],
	},
	{
		text: 'Configs',
		items: [{ text: '完整配置', link: '/configs/all-configs' }],
	},
];

const links: { url: string; lastmod?: number }[] = [];

export default defineConfig({
	title: 'creta',
	description: 'A CLI to create a react+electron+typescript App.',
	appearance: true, // 允许用户切换深色模式
	outDir: '../dist',
	cacheDir: '../cache',
	head: [
		[
			'link',
			{
				rel: 'icon',
				href: 'https://assets.kira.host/image/creta_logo_colored.svg',
			},
		],
	],
	themeConfig: {
		nav: [
			{
				text: 'Github Docs',
				link: 'https://github.com/ch1ny/creta/tree/master/docs',
			},
		],
		socialLinks: [
			{ icon: 'github', link: 'https://github.com/ch1ny/' },
			{
				icon: {
					svg: '<svg t="1662274378269" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1610" width="200" height="200"><path d="M824.8 613.2c-16-51.4-34.4-94.6-62.7-165.3C766.5 262.2 689.3 112 511.5 112 331.7 112 256.2 265.2 261 447.9c-28.4 70.8-46.7 113.7-62.7 165.3-34 109.5-23 154.8-14.6 155.8 18 2.2 70.1-82.4 70.1-82.4 0 49 25.2 112.9 79.8 159-26.4 8.1-85.7 29.9-71.6 53.8 11.4 19.3 196.2 12.3 249.5 6.3 53.3 6 238.1 13 249.5-6.3 14.1-23.8-45.3-45.7-71.6-53.8 54.6-46.2 79.8-110.1 79.8-159 0 0 52.1 84.6 70.1 82.4 8.5-1.1 19.5-46.4-14.5-155.8z" p-id="1611"></path></svg>',
				},
				// cSpell: disable-next-line
				link: 'tencent://AddContact/?fromId=45&fromSubId=1&subcmd=all&uin=1056317718&website=www.oicqzone.com',
			},
		],
		sidebar: {
			'/guide/': sideBar,
			'/feature/': sideBar,
			'/configs/': sideBar,
		},
	},
	transformHtml(_code, id, ctx) {
		if (/[\\/]404\.html$/.test(id)) return;

		links.push({
			url: ctx.pageData.relativePath.replace(/((^|\/)index)?\.md$/, '$2.html'),
			lastmod: ctx.pageData.lastUpdated,
		});
	},
	buildEnd(siteConfig) {
		const { outDir } = siteConfig;
		const sitemap = new SitemapStream({ hostname: 'https://creta.kira.host' });
		const sitemapWriteStream = fs.createWriteStream(path.resolve(outDir, 'sitemap.xml'));
		sitemap.pipe(sitemapWriteStream);
		links.forEach((link) => sitemap.write(link));
		sitemap.end();
	},
});
