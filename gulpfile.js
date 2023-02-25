const gulp = require('gulp');
const ts = require('gulp-typescript');
const clean = require('gulp-clean');
const cp = require('child_process');
const path = require('path');

const tsProject = ts.createProject('tsconfig.json');

gulp.task('clean', function () {
	return gulp
		.src(['lib', 'bin/exe'], { read: false, allowEmpty: true })
		.pipe(clean(['lib', 'bin/exe']));
});

gulp.task('tsc', function () {
	return tsProject.src().pipe(tsProject()).pipe(gulp.dest('lib'));
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
	gulp.series(gulp.parallel('clean'), gulp.parallel('tsc'), gulp.parallel('rust-updater'))
);
