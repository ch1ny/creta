type EBashColor =
	| 'white'
	| 'gray'
	| 'black'
	| 'blue'
	| 'cyan'
	| 'green'
	| 'magenta'
	| 'red'
	| 'yellow';

interface IConsoleService {
	log: (...data: any) => void;
	bold: (str: string) => void;
	italics: (str: string) => void;
	underline: (str: string) => void;
	inverse: (str: string) => void;
	lineThrough: (str: string) => void;
	color: (str: string, color: EBashColor) => void;
	background: (str: string, background: EBashColor) => void;
}

class ConsoleService implements IConsoleService {
	log(...data: any) {
		console.log(...data);
	}

	bold(str: string) {
		console.log('\x1B[1m%s\x1B[22m', str);
	}

	italics(str: string) {
		console.log('\x1B[3m%s\x1B[23m', str);
	}

	underline(str: string) {
		console.log('\x1B[4m%s\x1B[24m', str);
	}

	inverse(str: string) {
		console.log('\x1B[7m%s\x1B[27m', str);
	}

	lineThrough(str: string) {
		console.log('\x1B[9m%s\x1B[29m', str);
	}

	color(str: string, color: EBashColor) {
		switch (color) {
			case 'white':
				return console.log('\x1B[37m%s\x1B[39m', str);
			case 'gray':
				return console.log('\x1B[90m%s\x1B[39m', str);
			case 'black':
				return console.log('\x1B[30m%s\x1B[39m', str);
			case 'blue':
				return console.log('\x1B[34m%s\x1B[39m', str);
			case 'cyan':
				return console.log('\x1B[36m%s\x1B[39m', str);
			case 'green':
				return console.log('\x1B[32m%s\x1B[39m', str);
			case 'magenta':
				return console.log('\x1B[35m%s\x1B[39m', str);
			case 'red':
				return console.log('\x1B[31m%s\x1B[39m', str);
			case 'yellow':
				return console.log('\x1B[33m%s\x1B[39m', str);
		}
	}

	background(str: string, background: EBashColor) {
		switch (background) {
			case 'white':
				return console.log('\x1B[47m%s\x1B[49m', str);
			case 'gray':
				return console.log('\x1B[49;5;8m%s\x1B[49m', str);
			case 'black':
				return console.log('\x1B[40m%s\x1B[49m', str);
			case 'blue':
				return console.log('\x1B[44m%s\x1B[49m', str);
			case 'cyan':
				return console.log('\x1B[46m%s\x1B[49m', str);
			case 'green':
				return console.log('\x1B[42m%s\x1B[49m', str);
			case 'magenta':
				return console.log('\x1B[45m%s\x1B[49m', str);
			case 'red':
				return console.log('\x1B[41m%s\x1B[49m', str);
			case 'yellow':
				return console.log('\x1B[43m%s\x1B[49m', str);
		}
	}
}

export const consoleService = new ConsoleService();
