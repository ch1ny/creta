const fse = require('fs-extra');
const path = require('path');

const version = process.argv[2];
const projectRootDir = path.dirname(__dirname);

/**
 * 更新 package.json 版本号
 * @param {string} packageJsonPath
 * @returns
 */
async function updatePackageJsonVersion(packageJsonPath) {
	const json = await fse.readJSON(path.resolve(packageJsonPath));
	return await fse.writeJSON(
		packageJsonPath,
		{
			...json,
			version,
		},
		{
			spaces: '  ',
		}
	);
}

(async function main() {
	await Promise.all(
		[
			path.resolve(projectRootDir, 'package.json'),
			path.resolve(projectRootDir, 'src', 'cli', 'package.json'),
			path.resolve(projectRootDir, 'src', 'creta', 'package.json'),
		].map(updatePackageJsonVersion)
	);
})();
