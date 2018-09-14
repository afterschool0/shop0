'use strict';

namespace GulpModule {

    let gulp = require('gulp');
    let fs = require('graceful-fs');

    let typescript = require('gulp-typescript');
    //   let imagemin = require('gulp-imagemin');
    let cssmin = require('gulp-cssmin');

    //   let license = require('gulp-header');
    let uglifyjs = require('uglify-es');
    let composer = require('gulp-uglify/composer');
    let pump = require('pump');
    let minify = composer(uglifyjs, console);

    let rimraf = require('rimraf');

    //  const babel = require('gulp-babel');

    gulp.task('clean', (cb) => {
        rimraf('./product/reservation2', cb);
    });

    gulp.task('copy', ['clean'], () => {
        return gulp.src(
            [
                'config/systems/logs.json',
                'config/default.js',
                'logs/*',
                'models/**/*.js',
                'models/**/*.json',
                'public/**/*.js',
                'public/**/*.css',
                'server/**/*.js',
                'server/**/*.pug',
                'views/**/*.pug',
                'app.js',
                'package.json',
                'htdigest',
                'cluster.json'
            ],
            {base: '..'}
        )
            .pipe(gulp.dest('product'));
    });


    gulp.task('scriptbuild', ['copy'], () => {

        return gulp.src(
            [
                'models/**/*.ts',
                'public/**/*.ts',
                'server/**/*.ts',
                'app.ts'
            ],
            {base: '..'}
        )
            .pipe(typescript({target: "ES5", removeComments: true}))
            .pipe(gulp.dest('./'));
    });

    gulp.task('debugbuild', ['copy'], () => {
        console.log('debug build done');
    });

    gulp.task('cssmin', [], () => {

        return gulp.src(
            [
                'public/**/*.css',
            ],
            {base: '..'}
        )
            .pipe(cssmin())
            .pipe(gulp.dest('product'));
    });

    gulp.task('scriptmin', ['scriptbuild'], (cb) => {

        let options = {};

        let banner = [
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
            gulp.src(
                    [
                        'models/**/*.js',
                        'public/**/*.js',
                        'server/**/*.js',
                        'app.js'
                    ],
                    {base: '..'}
                ),
                minify(options),
                //        license(banner),
                gulp.dest('product')
            ],
            cb
        );

    });

    gulp.task('production', ['copy', 'cssmin', 'scriptmin'], () => {
        console.log('production done');
    });

    gulp.task('default', ['production'], () => {
        console.log('default done');
    });

}