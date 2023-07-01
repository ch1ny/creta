import fs from 'node:fs';
import Module from 'node:module';
import path from 'node:path';
import vm from 'node:vm';

const COMPILED_EXTNAME = '.ndc';

const readSourceHash = function (bytecodeBuffer: Buffer) {
	if (!Buffer.isBuffer(bytecodeBuffer)) {
		throw new Error('bytecodeBuffer must be a buffer object.');
	}

	if (process.version.startsWith('v8.8') || process.version.startsWith('v8.9')) {
		// Node is v8.8.x or v8.9.x
		// eslint-disable-next-line no-return-assign
		return bytecodeBuffer
			.subarray(12, 16)
			.reduce((sum, number, power) => (sum += number * Math.pow(256, power)), 0);
	} else {
		// eslint-disable-next-line no-return-assign
		return bytecodeBuffer
			.subarray(8, 12)
			.reduce((sum, number, power) => (sum += number * Math.pow(256, power)), 0);
	}
};

(<any>Module)._extensions[COMPILED_EXTNAME] = function (fileModule: Module, filename: string) {
	const bytecodeBuffer = fs.readFileSync(filename);

	// fixBytecode(bytecodeBuffer);

	const length = readSourceHash(bytecodeBuffer);

	let dummyCode = '';

	if (length > 1) {
		dummyCode = '"' + '\u200b'.repeat(length - 2) + '"'; // "\u200b" Zero width space
	}

	const script = new vm.Script(dummyCode, {
		filename: filename,
		lineOffset: 0,
		// displayErrors: true,
		cachedData: bytecodeBuffer,
	});

	if (script.cachedDataRejected) {
		throw new Error('Invalid or incompatible cached data (cachedDataRejected)');
	}

	/*
  This part is based on:
  https://github.com/zertosh/v8-compile-cache/blob/7182bd0e30ab6f6421365cee0a0c4a8679e9eb7c/v8-compile-cache.js#L158-L178
  */

	function require(id: string) {
		return fileModule.require(id);
	}
	require.resolve = function (request: any, options: any) {
		// @ts-ignore
		return Module._resolveFilename(request, fileModule, false, options);
	};
	if (process.mainModule) {
		require.main = process.mainModule;
	}

	// @ts-ignore
	require.extensions = Module._extensions;
	// @ts-ignore
	require.cache = Module._cache;

	const compiledWrapper = script.runInThisContext({
		filename: filename,
		lineOffset: 0,
		columnOffset: 0,
		displayErrors: true,
	});

	const dirname = path.dirname(filename);

	const args = [fileModule.exports, require, fileModule, filename, dirname, process, global];

	return compiledWrapper.apply(fileModule.exports, args);
};
