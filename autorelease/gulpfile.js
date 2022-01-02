var gulp = require('gulp');
var ts = require("gulp-typescript");
var preserveWhitespace = require('gulp-preserve-typescript-whitespace');
 
gulp.task("default", function () {
    return gulp.src('./../TypescriptServer/src/**/*.ts')
        .pipe(preserveWhitespace.saveWhitespace())    // Encodes whitespaces/newlines so TypeScript compiler won't remove them
        .pipe(ts('./../TypescriptServer/tsconfig.json'))          // TypeScript compiler must be run with "removeComments: false" option
        .js
        .pipe(preserveWhitespace.restoreWhitespace()) // Restores encoded whitespaces/newlines
        // .pipe(gulp.dest("../JavascriptServer/"));
        .pipe(gulp.dest("out"));
});