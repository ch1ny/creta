import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { HuffmanTree } from '../core';

const writeContents = async (dirPath: string, contents: Record<string, any>) => {
	const fileNames = Object.keys(contents);

	const traversal = async (fileName: string) => {
		const content = contents[fileName];

		if (typeof content === 'string') {
			await fs.promises.writeFile(path.join(dirPath, fileName), content);
		} else {
			await fs.promises.mkdir(path.join(dirPath, fileName));
			await writeContents(path.join(dirPath, fileName), content);
		}
	};

	await Promise.all(fileNames.map(traversal));
};

export const decompress = async (sourcePath: string, targetPath: string) => {
	const finalTargetPath = path.resolve(targetPath);

	if (path.extname(sourcePath) !== '.eup') {
		console.log(chalk.red('源文件不是 eup 文件'));
		process.exit(-1);
	}

	try {
		const contents = await fs.promises.readFile(sourcePath, 'utf8');
		const contentsJSON = JSON.parse(contents);
		const { codesMap, hexString } = contentsJSON;
		const decodedContents = JSON.parse(HuffmanTree.decodeHex(hexString, codesMap));

		await fs.promises.access(finalTargetPath).catch(() =>
			fs.promises.mkdir(finalTargetPath, {
				recursive: true,
			})
		);

		await writeContents(targetPath, decodedContents);
	} catch (e) {
		console.log(chalk.red('源文件已损坏'));
		process.exit(-1);
	}
};
