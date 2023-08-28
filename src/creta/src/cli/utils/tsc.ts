import chalk from 'chalk';
import fse from 'fs-extra';
import path from 'path';
import ts from 'typescript';

const formatHost: ts.FormatDiagnosticsHost = {
	getCanonicalFileName: (path) => path,
	getCurrentDirectory: ts.sys.getCurrentDirectory,
	getNewLine: () => ts.sys.newLine,
};

const reportDiagnostic = (diagnostic: ts.Diagnostic) => {
	console.log(
		chalk.red(
			'Error',
			diagnostic.code,
			':',
			ts.flattenDiagnosticMessageText(diagnostic.messageText, formatHost.getNewLine())
		)
	);
};

const reportWatchStatusChanged = (diagnostic: ts.Diagnostic) => {
	let message = ts.formatDiagnostic(diagnostic, formatHost);
	if (message.indexOf('TS6194') > 0) {
		message = message.replace(/message\sTS[0-9]{4}:(.+)(\s+)$/, '$1').trim();
		console.log('\x1B[36m%s\x1B[39m', message);
	}
};

type TBeforeCompileCallback = (
	defaultCallback: ts.CreateProgram<ts.SemanticDiagnosticsBuilderProgram>,
	rootNames?: readonly string[] | undefined,
	options?: ts.CompilerOptions | undefined,
	host?: ts.CompilerHost | undefined,
	oldProgram?: ts.SemanticDiagnosticsBuilderProgram | undefined,
	configFileParsingDiagnostics?: readonly ts.Diagnostic[] | undefined,
	projectReferences?: readonly ts.ProjectReference[] | undefined
) => ts.SemanticDiagnosticsBuilderProgram;

type TAfterCompileCallback = (
	program: ts.SemanticDiagnosticsBuilderProgram,
	defaultCallback?: TAfterCompileCallback
) => void;

/**
 * tsc watch
 * @param configPath tsconfig.json 路径
 * @param callbacks 关键节点回调
 * @returns
 */
export const tscWatch = (
	configPath: string,
	callbacks: {
		onBeforeCompile?: TBeforeCompileCallback;
		onAfterCompile?: TAfterCompileCallback;
		onBeforeFirstCompile?: TBeforeCompileCallback;
		onAfterFirstCompile?: TAfterCompileCallback;
	} = {}
) => {
	const createProgram = ts.createSemanticDiagnosticsBuilderProgram;
	const host = ts.createWatchCompilerHost(
		configPath,
		{},
		ts.sys,
		createProgram,
		reportDiagnostic,
		reportWatchStatusChanged
	);

	const { onAfterCompile, onBeforeCompile } = callbacks;
	const onBeforeFirstCompile = callbacks.onBeforeFirstCompile || onBeforeCompile;
	const onAfterFirstCompile = callbacks.onAfterFirstCompile || onAfterCompile;

	let firstCompilation = true;

	const defaultCreateProgram = host.createProgram;
	host.createProgram = (rootNames, options, host, oldProgram) => {
		if (onBeforeCompile) {
			if (!firstCompilation)
				return onBeforeCompile(defaultCreateProgram, rootNames, options, host, oldProgram);

			return onBeforeFirstCompile!(defaultCreateProgram, rootNames, options, host, oldProgram);
		}

		return defaultCreateProgram(rootNames, options, host, oldProgram);
	};
	const defaultAfterProgramCreate = host.afterProgramCreate;
	host.afterProgramCreate = (program) => {
		if (onAfterCompile) {
			if (!firstCompilation) return onAfterCompile(program, defaultAfterProgramCreate);

			firstCompilation = false;
			return onAfterFirstCompile!(program, defaultAfterProgramCreate);
		}

		defaultAfterProgramCreate?.(program);
	};

	return ts.createWatchProgram(host);
};

type TsConfigJson = {
	compilerOptions?: ts.CompilerOptions;
};

async function analyzeTsCompilerOptions(configPath: string) {
	const tsconfig = await fse.readJSON(configPath);
	let {
		/* 枚举字段 */
		importsNotUsedAsValues,
		jsx,
		module,
		moduleResolution,
		moduleDetection,
		newLine,
		target,
		/* 路径字段 */
		tsBuildInfoFile,
		rootDir,
		baseUrl = './',
		rootDirs,
		typeRoots,
		types,
		outFile,
		outDir,
		declarationDir,
		/* 路径别名 */
		paths = {},
		...options
	} = tsconfig.compilerOptions || {};

	if (importsNotUsedAsValues) {
		switch (importsNotUsedAsValues.toLowerCase()) {
			case 'remove':
				importsNotUsedAsValues = ts.ImportsNotUsedAsValues.Remove;
				break;
			case 'preserve':
				importsNotUsedAsValues = ts.ImportsNotUsedAsValues.Preserve;
				break;
			case 'error':
				importsNotUsedAsValues = ts.ImportsNotUsedAsValues.Error;
				break;
		}
	}
	if (jsx) {
		switch (jsx.toLowerCase()) {
			case 'react':
				jsx = ts.JsxEmit.React;
				break;
			case 'react-jsx':
				jsx = ts.JsxEmit.ReactJSX;
				break;
			case 'react-jsxdev':
				jsx = ts.JsxEmit.ReactJSXDev;
				break;
			case 'preserve':
				jsx = ts.JsxEmit.Preserve;
				break;
			case 'react-native':
				jsx = ts.JsxEmit.ReactNative;
				break;
		}
	}
	if (module) {
		switch (module.toLowerCase()) {
			case 'commonjs':
				module = ts.ModuleKind.CommonJS;
				break;
			case 'umd':
				module = ts.ModuleKind.UMD;
				break;
			case 'amd':
				module = ts.ModuleKind.AMD;
				break;
			case 'system':
				module = ts.ModuleKind.System;
				break;
			case 'esnext':
				module = ts.ModuleKind.ESNext;
				break;
			case 'es2015':
			case 'es6':
				module = ts.ModuleKind.ES2015;
				break;
			case 'es2020':
				module = ts.ModuleKind.ES2020;
				break;
			case 'es2022':
				module = ts.ModuleKind.ES2022;
				break;
			case 'node16':
				module = ts.ModuleKind.Node16;
				break;
			case 'nodenext':
				module = ts.ModuleKind.NodeNext;
				break;
		}
	}
	if (moduleResolution) {
		switch (moduleResolution.toLowerCase()) {
			case 'node16':
				moduleResolution = ts.ModuleResolutionKind.Node16;
				break;
			case 'nodenext':
				moduleResolution = ts.ModuleResolutionKind.NodeNext;
				break;
			case 'node10':
			case 'node':
				moduleResolution = ts.ModuleResolutionKind.NodeJs;
				break;
			case 'classic':
				moduleResolution = ts.ModuleResolutionKind.Classic;
				break;
		}
	}
	if (moduleDetection) {
		switch (moduleDetection.toLowerCase()) {
			case 'auto':
				moduleDetection = ts.ModuleDetectionKind.Auto;
				break;
			case 'force':
				moduleDetection = ts.ModuleDetectionKind.Force;
				break;
			case 'legacy':
				moduleDetection = ts.ModuleDetectionKind.Legacy;
				break;
		}
	}
	if (newLine) {
		switch (newLine.toLowerCase()) {
			case 'crlf':
				newLine = ts.NewLineKind.CarriageReturnLineFeed;
				break;
			case 'lf':
				newLine = ts.NewLineKind.LineFeed;
				break;
		}
	}
	if (target) {
		switch (target.toLowerCase()) {
			case 'es3':
				target = ts.ScriptTarget.ES3;
				break;
			case 'es5':
				target = ts.ScriptTarget.ES5;
				break;
			case 'es6':
			case 'es2015':
				target = ts.ScriptTarget.ES2015;
				break;
			case 'es2016':
				target = ts.ScriptTarget.ES2016;
				break;
			case 'es2017':
				target = ts.ScriptTarget.ES2017;
				break;
			case 'es2018':
				target = ts.ScriptTarget.ES2018;
				break;
			case 'es2019':
				target = ts.ScriptTarget.ES2019;
				break;
			case 'es2020':
				target = ts.ScriptTarget.ES2020;
				break;
			case 'es2021':
				target = ts.ScriptTarget.ES2021;
				break;
			case 'es2022':
				target = ts.ScriptTarget.ES2022;
				break;
			case 'esnext':
				target = ts.ScriptTarget.ESNext;
				break;
		}
	}

	baseUrl = path.isAbsolute(baseUrl) ? baseUrl : path.resolve(configPath, '..', baseUrl);

	function resolvePath(originalPath: string | undefined) {
		if (!originalPath) return originalPath;

		return path.isAbsolute(originalPath) ? originalPath : path.resolve(baseUrl, originalPath);
	}

	tsBuildInfoFile = resolvePath(tsBuildInfoFile);
	rootDir = resolvePath(rootDir);
	rootDirs = rootDirs?.map((dir: string) => resolvePath(dir)).filter(Boolean) as
		| string[]
		| undefined;
	typeRoots = typeRoots?.map((root: string) => resolvePath(root)).filter(Boolean) as
		| string[]
		| undefined;
	types = types?.map((t: string) => resolvePath(t)).filter(Boolean) as string[] | undefined;
	outFile = resolvePath(outFile);
	outDir = resolvePath(outDir);
	declarationDir = resolvePath(declarationDir);

	return {
		importsNotUsedAsValues,
		jsx,
		module,
		moduleResolution,
		moduleDetection,
		newLine,
		target,

		tsBuildInfoFile,
		rootDir,
		baseUrl,
		rootDirs,
		typeRoots,
		types,
		outFile,
		outDir,
		declarationDir,

		paths,

		...options,
	} as ts.CompilerOptions;
}

/**
 * tsc build
 * @param configPath tsconfig.json 路径
 * @returns
 */
export const tscBuild = async (rootFiles: string[], configPath: string) => {
	const tsconfig: TsConfigJson = await fse.readJSON(configPath);

	const options = await analyzeTsCompilerOptions(configPath);

	const host = ts.createCompilerHost(tsconfig.compilerOptions || {});
	const aliasMap: { [key: string]: string[] } = {};
	Object.keys(options.paths!).forEach((key) => {
		const resolvedPath = path.resolve(options.baseUrl!, options.paths![key][0]);
		const alias = key.replace(/\/\*$/, '');
		aliasMap[alias] = [resolvedPath];
	});
	console.log(aliasMap);

	// host.resolveModuleNames = (moduleNames, containingFile) => {
	// 	const resolvedModules: ts.ResolvedModule[] = [];
	// 	moduleNames.forEach((moduleName) => {
	// 		if (moduleName in aliasMap) {
	// 			const resolvedFileName = aliasMap[moduleName][0];
	// 			resolvedModules.push({ resolvedFileName });
	// 		} else {
	// 			const result = ts.resolveModuleName(moduleName, containingFile, options, host);
	// 			if (result.resolvedModule) {
	// 				resolvedModules.push(result.resolvedModule);
	// 			} else {
	// 				console.log(moduleName, containingFile);
	// 			}
	// 		}
	// 	});
	// 	return resolvedModules;
	// };

	host.writeFile;

	const program = ts.createProgram({
		rootNames: options.allowJs ? rootFiles : rootFiles.filter((file) => file.endsWith('.ts')),
		options,
		host,
	});

	const emitResult = program.emit();

	const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

	allDiagnostics.forEach((diagnostic) => {
		if (diagnostic.file) {
			let { line, character } = ts.getLineAndCharacterOfPosition(
				diagnostic.file,
				diagnostic.start!
			);
			let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
			console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
		} else {
			console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
		}
	});
};
