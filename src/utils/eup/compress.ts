import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { HuffmanTree } from '../core';

const readDirContents = async (dirPath: string) => {
	const contents: Record<string, any> = {};
	const files = await fs.promises.readdir(dirPath);
	let nextDirs = files.map((f) => [f]);

	// 去除递归写法，防止栈溢出
	const traversal = async (filePaths: string[]) => {
		const targetFilePath = path.join(dirPath, ...filePaths);
		const stats = await fs.promises.stat(targetFilePath);
		if (stats.isDirectory()) {
			console.log('开始处理', chalk.cyan(`${targetFilePath}${path.sep}`));
			(await fs.promises.readdir(targetFilePath)).forEach((f) => {
				nextDirs.push([...filePaths, f]);
			});
		} else {
			console.log('开始处理', chalk.green(targetFilePath));
			const fileContent = await fs.promises.readFile(targetFilePath, 'utf8');
			// 根据路径设置值
			let contentCur: any = contents;
			filePaths.slice(0, -1).forEach((dir) => {
				if (contentCur[dir] === undefined) {
					contentCur[dir] = {};
				}
				contentCur = contentCur[dir];
			});
			contentCur[filePaths.slice(-1)[0]] = fileContent;
		}
	};

	do {
		const traversalDirs = [...nextDirs];
		nextDirs = [];
		await Promise.all(traversalDirs.map(traversal));
	} while (!!nextDirs.length);

	return contents;
};

export const compress = async (sourcePath: string, targetPath: string) => {
	const finalSourcePath = path.resolve(sourcePath);
	const finalTargetPath = path.extname(targetPath) !== '.eup' ? `${targetPath}.eup` : targetPath;

	const stats = await fs.promises.stat(sourcePath);
	const contents = await (async () => {
		if (stats.isDirectory()) {
			return await readDirContents(finalSourcePath);
		} else {
			return {
				[path.basename(sourcePath)]: await fs.promises.readFile(sourcePath, 'utf8'),
			};
		}
	})();

	const { codesMap, hexString } = new HuffmanTree(JSON.stringify(contents));
	await fs.promises.writeFile(
		finalTargetPath,
		JSON.stringify({
			codesMap,
			hexString,
		})
	);
};
