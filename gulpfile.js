const gulp = require('gulp');
const ts = require('gulp-typescript');
const clean = require('gulp-clean');
const cp = require('child_process');
const path = require('path');

const tsCoreProject = ts.createProject('tsconfig.core.json');
const tsPlugProject = ts.createProject('tsconfig.plug.json');

gulp.task('clean', function () {
	return gulp
		.src(['lib', 'types', 'bin/exe'], { read: false, allowEmpty: true })
		.pipe(clean(['lib', 'types', 'bin/exe']));
});

gulp.task('tsc-core', function () {
	return tsCoreProject.src().pipe(tsCoreProject()).pipe(gulp.dest('lib'));
});

gulp.task('tsc-plug', function () {
	return tsPlugProject.src().pipe(tsPlugProject()).pipe(gulp.dest('types'));
});

gulp.task('rust-updater', function () {
	cp.execSync('cargo build --release', {
		cwd: path.resolve(__dirname, 'creta-updater'),
	});
	const outDir = path.resolve(__dirname, 'bin', 'exe');
	const updaterDir = path.resolve(__dirname, 'creta-updater');
	return gulp
		.src([
			path.resolve(updaterDir, 'target', 'release', 'eup.exe'),
			path.resolve(updaterDir, 'target', 'release', 'updater.exe'),
		])
		.pipe(gulp.dest(outDir));
});

gulp.task(
	'default',
	gulp.series(
		gulp.parallel('clean'),
		gulp.parallel('tsc-core'),
		gulp.parallel('tsc-plug'),
		gulp.parallel('rust-updater')
	)
);
