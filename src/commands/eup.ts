import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { HuffmanTree } from '../utils/core';

const readDirContents = async (dirPath: string) => {
	const contents: Record<string, any> = {};
	const files = await fs.promises.readdir(dirPath);

	const traversal = async (fileName: string) => {
		const stats = await fs.promises.stat(path.join(dirPath, fileName));
		if (stats.isDirectory()) {
			contents[fileName] = await readDirContents(path.join(dirPath, fileName));
		} else {
			contents[fileName] = await fs.promises.readFile(path.join(dirPath, fileName), 'utf8');
		}
	};

	await Promise.all(files.map(traversal));

	return contents;
};

const compressEntry = async (sourcePath: string, targetPath: string) => {
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

const decompressEntry = async (sourcePath: string, targetPath: string) => {
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

		writeContents(targetPath, decodedContents);
	} catch (e) {
		console.log(chalk.red('源文件已损坏'));
		process.exit(-1);
	}
};

export default async (
	sourcePath: string,
	targetPath: string,
	props: {
		decompress: boolean;
	}
) => {
	if (props.decompress) {
		await decompressEntry(sourcePath, targetPath);
	} else {
		await compressEntry(sourcePath, targetPath);
	}
};
