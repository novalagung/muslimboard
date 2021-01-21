'use strict'

import babelify   from 'babelify'
import browserify from 'browserify'
import buffer     from 'vinyl-buffer'
import source     from 'vinyl-source-stream'
import watchify   from 'watchify'

import gulp       from 'gulp'
import prefix     from 'gulp-autoprefixer'
import concat     from 'gulp-concat'
import cssmin     from 'gulp-cssmin'
import less       from 'gulp-less'
import livereload from 'gulp-livereload'
import plumber    from 'gulp-plumber'
import sourcemaps from 'gulp-sourcemaps'
import uglify     from 'gulp-uglify'
import gutil      from 'gulp-util'
import webserver  from 'gulp-webserver'

let src = './src'
let dst = './res/assets/core'

let compileJS = (watch) => {
    // watch only the main js file
    let main = 'main.js'

    let bundler = watchify(browserify(`${src}/${main}`, { debug: true })
        .transform(babelify))

    let rebundle = () => {
        bundler.bundle()
            .on('error', (err) => { console.error(err), this.emit('end') })
            .pipe(source(main))
            .pipe(buffer())
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(uglify()).on('error', gutil.log)
            .pipe(concat('main.min.js'))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(dst))
    }

    if (watch) {
        bundler.on('update', () => {
            console.log('-> bundling...')
            rebundle()
        })
    }

    rebundle()
}

let compileLESS = (watch) => {
    // watch only the main less file
    let main = 'main.less'

    let rebundle = () => {
        gulp.src(`${src}/${main}`)
            .pipe(plumber())
            .pipe(less())
            .pipe(prefix("last 8 version", "> 1%", "ie 8", "ie 7"), { cascade: true })
            .pipe(cssmin())
            .pipe(concat('main.min.css'))
            .pipe(gulp.dest(dst))
            .pipe(livereload())
    }

    if (watch) {
        gulp.watch(`${src}/*.less`, () => {
            livereload.listen()
            rebundle()
        })
    }

    rebundle()
}

gulp.task('build', () => { 
    compileJS()
    compileLESS()
})

gulp.task('watch', () => {
    compileJS(true)
    compileLESS(true)
})

gulp.task('webserver', () => {
    gulp.src('.').pipe(webserver({
        livereload: true,
        directoryListing: true,
        fallback: 'index.html'
    }))
})

gulp.task('default', gulp.series('watch', 'webserver'))
