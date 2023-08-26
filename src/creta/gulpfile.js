const gulp = require('gulp');
const ts = require('gulp-typescript');
const clean = require('gulp-clean');
const cp = require('child_process');
const path = require('path');

const tsCliProject = ts.createProject('tsconfig.cli.json');
const tsPlugProject = ts.createProject('tsconfig.plug.json');

gulp.task('clean', function () {
	return gulp
		.src(['cli', 'plugins', 'bin/exe'], { read: false, allowEmpty: true })
		.pipe(clean(['cli', 'plugins', 'bin/exe']));
});

gulp.task('tsc-cli', function () {
	return tsCliProject.src().pipe(tsCliProject()).pipe(gulp.dest('cli'));
});

gulp.task('tsc-plug', function () {
	return tsPlugProject.src().pipe(tsPlugProject()).pipe(gulp.dest('plugins'));
});

gulp.task('rust-updater-darwin', function () {
	cp.execSync('cargo build --release', {
		cwd: path.resolve(__dirname, 'creta-updater'),
	});
	const outDir = path.resolve(__dirname, 'bin', 'exe');
	const updaterDir = path.resolve(__dirname, 'creta-updater');

	return gulp
		.src([
			path.resolve(updaterDir, 'target', 'release', 'eup'),
			path.resolve(updaterDir, 'target', 'release', 'updater'),
		])
		.pipe(gulp.dest(path.resolve(outDir, 'darwin')));
});

gulp.task('rust-updater-windows', function () {
	cp.execSync('cargo build --release --target x86_64-pc-windows-gnu', {
		cwd: path.resolve(__dirname, 'creta-updater'),
	});
	const outDir = path.resolve(__dirname, 'bin', 'exe');
	const updaterDir = path.resolve(__dirname, 'creta-updater');

	return gulp
		.src([
			path.resolve(updaterDir, 'target', 'x86_64-pc-windows-gnu', 'release', 'eup.exe'),
			path.resolve(updaterDir, 'target', 'x86_64-pc-windows-gnu', 'release', 'updater.exe'),
		])
		.pipe(gulp.dest(path.resolve(outDir, 'win32')));
});

gulp.task(
	'default',
	gulp.series(
		gulp.parallel('clean'),
		gulp.parallel('tsc-cli'),
		gulp.parallel('tsc-plug'),
		gulp.parallel('rust-updater-darwin'),
		gulp.parallel('rust-updater-windows')
	)
);
