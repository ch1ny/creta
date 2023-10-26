import fs from 'fs';
import path from 'path';

export default async function (dir: string) {
	const mainRootDir = path.resolve(dir);

	const nextDirList = [mainRootDir];
	const filesToBuild: string[] = [];

	let nextDir: string | undefined;
	while ((nextDir = nextDirList.shift())) {
		const files = await fs.promises.readdir(path.resolve(nextDir));
		await Promise.all(
			files.map(async (fileName) => {
				const filePath = path.resolve(nextDir!, fileName);
				const fsStatus = await fs.promises.stat(filePath);
				if (fsStatus.isDirectory()) {
					nextDirList.push(filePath);
				} else if (filePath.endsWith('.js') || filePath.endsWith('.ts')) {
					filesToBuild.push(filePath);
				}
			})
		);
	}

	return filesToBuild;
}
