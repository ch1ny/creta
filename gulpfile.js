const gulp = require('gulp');
const ts = require('gulp-typescript');
const clean = require('gulp-clean');

const tsProject = ts.createProject('tsconfig.json');

gulp.task('clean', function () {
	return gulp.src('lib', { read: false, allowEmpty: true }).pipe(clean('lib'));
});

gulp.task('tsc', function () {
	return tsProject.src().pipe(tsProject()).pipe(gulp.dest('lib'));
});

gulp.task('default', gulp.series(gulp.parallel('clean'), gulp.parallel('tsc')));
