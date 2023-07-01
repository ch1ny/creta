import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { type Plugin } from 'vite';

import { compileFile, Cache } from './compiler';

type TNodecPluginProps = {
	includes?: string[];
	excludes?: string[];
	requirePath: string;
};

async function compileIncludes(props: TNodecPluginProps) {
	const { includes = [], excludes = [], requirePath } = props;

	await Promise.all(
		includes.map(async (entry) => {
			try {
				await fs.promises.access(entry, fs.constants.R_OK);
			} catch (ex) {
				console.log(chalk.red(ex));
				return;
			}

			if ((await fs.promises.stat(entry)).isDirectory()) {
				await compileIncludes({
					...props,
					includes: (
						await fs.promises.readdir(entry)
					).map((children) => path.resolve(entry, children)),
				});
			} else if (
				path.extname(entry) !== '.js' ||
				path.resolve(entry) === path.resolve(requirePath) ||
				excludes.includes(path.resolve(entry))
			) {
			} else {
				await compileFile(entry);
			}
		})
	);
}

export default function (props: TNodecPluginProps): Plugin {
	return {
		name: 'vite-plugin-creta-nodec',
		apply: 'build',
		enforce: 'post',
		async closeBundle() {
			await new Promise<void>((resolve) => {
				setTimeout(() => {
					resolve();
				}, 1000);
			});
			await Cache.outputRequire(props.requirePath);
			await compileIncludes({
				...props,
				excludes: props.excludes?.map((exclude) => path.resolve(exclude)),
			});
		},
	};
}
