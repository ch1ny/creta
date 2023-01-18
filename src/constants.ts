import cp from 'child_process';
import path from 'path';

class Constants {
	private _gitName?: string;
	get gitName() {
		if (this._gitName !== undefined) return this._gitName;
		this._gitName = cp.execSync('git config --global user.name', { encoding: 'utf8' }).trim();
		return this._gitName;
	}

	cliDir = path.resolve(__dirname, '..');
	templatesDir = path.join(this.cliDir, 'templates');
}

export const constants = new Constants();
