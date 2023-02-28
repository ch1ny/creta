import ts from 'typescript';

const formatHost: ts.FormatDiagnosticsHost = {
	getCanonicalFileName: (path) => path,
	getCurrentDirectory: ts.sys.getCurrentDirectory,
	getNewLine: () => ts.sys.newLine,
};

const reportDiagnostic = (diagnostic: ts.Diagnostic) => {
	console.error(
		'Error',
		diagnostic.code,
		':',
		ts.flattenDiagnosticMessageText(diagnostic.messageText, formatHost.getNewLine())
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
