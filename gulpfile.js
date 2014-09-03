'use strict';
var gulp       = require('gulp'),
    sass       = require('gulp-ruby-sass'),
    livereload = require('gulp-livereload'),
    jade       = require('gulp-jade'),
    notify     = require('gulp-notify'),
    clean      = require('gulp-clean'),
    bower      = require('main-bower-files'),
    lr         = require('tiny-lr'),
    gulpFilter = require('gulp-filter'),
    flatten    = require('gulp-flatten'),
    server     = lr();

gulp.task('styles', function () {
    return gulp.src('./src/stylesheets/**/*.scss')
    .pipe(sass({style: 'expanded'}))
    .pipe(gulp.dest('./dist/assets/css'))
    .pipe(livereload(server))
    .pipe(notify({ message: 'styles task complete' }));
});

gulp.task('scripts', function () {
    return gulp.src('./src/scripts/**/*.js')
    .pipe(gulp.dest('./dist/assets/js'))
    .pipe(livereload(server))
    .pipe(notify({ message: 'scripts task complete' }));
});

gulp.task('templates', function () {
    return gulp.src('./src/**/*.jade')
    .pipe(jade())
    .pipe(gulp.dest('./dist/'))
    .pipe(livereload(server))
    .pipe(notify({ message: 'templates task complete' }));
});

gulp.task('bower', function () {
    var jsFilter, cssFilter, fontFilter;
    jsFilter   = gulpFilter('*.js');
    cssFilter  = gulpFilter('*.css');
    fontFilter = gulpFilter(['*.eot', '*.woff', '*.svg', '*.ttf']);
    
    return gulp.src(bower())
    .pipe(jsFilter)
    .pipe(gulp.dest('dist/assets/vendor/js'))
    .pipe(jsFilter.restore())

    .pipe(cssFilter)
    .pipe(gulp.dest('dist/assets/vendor/css'))
    .pipe(cssFilter.restore())

    .pipe(fontFilter)
    .pipe(flatten())
    .pipe(gulp.dest('dist/assets/vendor/fonts'))
});

gulp.task('clean', function () {
    var dirs = ['./dist/assets/css', './dist/assets/js', './dist/assets', './dist/assets/vendor'];
    return gulp.src(dirs, {read: false})
    .pipe(clean());
});

gulp.task('default', ['clean'], function () {
    gulp.start('styles', 'scripts', 'templates', 'bower');
});

gulp.task('watch', function () {
    server.listen(35729, function (err) {
        if (err) {
            return console.log(err);
        }
        gulp.watch('./src/stylesheets/**/*.scss', ['styles']);
        gulp.watch('./src/scripts/**/*.js', ['scripts']);
        gulp.watch('./src/**/*.jade', ['templates']);
    });
});