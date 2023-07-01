import fs from 'node:fs';
import Module from 'node:module';
import path from 'node:path';
import vm from 'node:vm';

import { COMPILED_EXTNAME } from './constants';

export class Cache {
	private static _requirePath?: string;

	static get requirePath() {
		return this._requirePath;
	}

	static async outputRequire(output: string) {
		if (!!this._requirePath) {
			throw new Error('The require script has been outputted.');
		}

		const requireScriptCode = await fs.promises.readFile(
			path.resolve(__dirname, 'require.js'),
			'utf8'
		);

		await fs.promises.writeFile(output, requireScriptCode);

		this._requirePath = output;
	}
}

function compileCode(jsCode: string): Buffer {
	const script = new vm.Script(jsCode, {
		produceCachedData: true,
	});

	const bytecodeBuffer =
		typeof script.createCachedData === 'function' ? script.createCachedData() : script.cachedData;

	return bytecodeBuffer || Buffer.from([]);
}

async function loader(input: string, output: string) {
	const relativePath = path.relative(
		path.resolve(input, '..'),
		path.resolve(Cache.requirePath as string)
	);

	const loaderCode = `require('${
		relativePath.startsWith('.') ? relativePath : './' + relativePath
	}');\n\nmodule.exports=require('./${path.basename(output)}');\n`;

	await fs.promises.writeFile(input, loaderCode);
}

export async function compileFile(input: string) {
	const output = input.slice(0, -path.extname(input).length) + COMPILED_EXTNAME;

	const jsCode = await fs.promises.readFile(input, 'utf8');

	const code = Module.wrap(jsCode.replace(/^#!.*/, ''));

	const compiledBuffer = compileCode(code);

	await fs.promises.writeFile(output, compiledBuffer);

	await loader(input, output);

	return {
		output,
		buffer: compiledBuffer,
	};
}
