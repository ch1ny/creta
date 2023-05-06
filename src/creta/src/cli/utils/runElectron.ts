import cp from 'child_process';
import electronCommand from 'electron/index';

export const runElectron = (
	args: string[],
	options: cp.SpawnOptions,
	onClose?: (code: number | null, signal: NodeJS.Signals | null) => void
) => {
	const child = cp.spawn(electronCommand, args, {
		...options,
		stdio: 'pipe',
		windowsHide: false,
	});
	child.on('close', function (code, signal) {
		// if (code === null) {
		// 	console.error(electronCommand, 'exited with signal', signal);
		// 	process.exit(1);
		// }
		// process.exit(code);
		onClose?.(code, signal);
	});

	child.stdout.on('data', (chunk) => {
		process.stdout.write(chunk);
	});

	const handleTerminationSignal = function (signal: NodeJS.Signals) {
		process.on(signal, function signalHandler() {
			if (!child.killed) {
				child.kill(signal);
			}
		});
	};

	handleTerminationSignal('SIGINT');
	handleTerminationSignal('SIGTERM');

	return () => {
		if (!child.killed) {
			child.kill();
		}
	};
};
