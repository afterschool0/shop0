'use strict';
var GulpModule;
(function (GulpModule) {
    var gulp = require('gulp');
    var fs = require('graceful-fs');
    var typescript = require('gulp-typescript');
    //   let imagemin = require('gulp-imagemin');
    var cssmin = require('gulp-cssmin');
    //   let license = require('gulp-header');
    var uglifyjs = require('uglify-es');
    var composer = require('gulp-uglify/composer');
    var pump = require('pump');
    var minify = composer(uglifyjs, console);
    var rimraf = require('rimraf');
    gulp.task('clean', function (cb) {
        rimraf('./product/reservation2', cb);
    });
    gulp.task('copy', ['clean'], function () {
        return gulp.src([
            'config/systems/logs.json',
            'config/default.js',
            'logs/*',
            'models/**/*.js',
            'models/**/*.json',
            'public/**/*.js',
            'public/**/*.css',
            'public/*.html',
            'routes/**/*.js',
            'server/**/*.js',
            'server/**/*.pug',
            'views/**/*.pug',
            'app.js',
            'package.json',
            'htdigest',
            'cluster.json'
        ], { base: '..' })
            .pipe(gulp.dest('product'));
    });
    gulp.task('scriptbuild', ['copy'], function () {
        return gulp.src([
            'models/**/*.ts',
            'public/**/*.ts',
            'server/**/*.ts',
            'app.ts'
        ], { base: '..' })
            .pipe(typescript({ target: "ES5", removeComments: true }))
            .pipe(gulp.dest('./'));
    });
    gulp.task('debugbuild', ['copy'], function () {
        console.log('debug build done');
    });
    gulp.task('cssmin', [], function () {
        return gulp.src([
            'public/**/*.css',
        ], { base: '..' })
            .pipe(cssmin())
            .pipe(gulp.dest('product'));
    });
    gulp.task('scriptmin', ['scriptbuild'], function (cb) {
        var options = {};
        var banner = [
            '/*',
            ' Copyright (c) 2017 7thCode.',
            ' Version: 1.0.0',
            ' Author: 7thCode.',
            ' Website: http://seventh-code.com',
            ' Issues: http://seventh-code.com',
            '*/',
            ''
        ].join('\n');
        pump([
            gulp.src([
                'models/**/*.js',
                'public/**/*.js',
                'server/**/*.js',
                'app.js'
            ], { base: '..' }),
            minify(options),
            //        license(banner),
            gulp.dest('product')
        ], cb);
    });
    gulp.task('production', ['copy', 'cssmin', 'scriptmin'], function () {
        console.log('production done');
    });
    gulp.task('default', ['production'], function () {
        console.log('default done');
    });
})(GulpModule || (GulpModule = {}));
//# sourceMappingURL=gulpfile.js.map