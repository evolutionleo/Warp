const gulp = require('gulp');
const ts = require('gulp-typescript');
const through = require('through2');

function preserveNewlines() {
  return through.obj(function(file, encoding, callback) {
    const data = file.contents.toString('utf8');
    const fixedUp = data.replace(/\n\n/g, '\n/** THIS_IS_A_NEWLINE **/');
    file.contents = Buffer.from(fixedUp, 'utf8');
    callback(null, file);
  });
}

function restoreNewlines() {
  return through.obj(function(file, encoding, callback) {
    const data = file.contents.toString('utf8');
    const fixedUp = data.replace(/\/\*\* THIS_IS_A_NEWLINE \*\*\//g, '\n');
    file.contents = Buffer.from(fixedUp, 'utf8');
    callback(null, file);
  });
}

gulp.task('default', function () {
  return gulp.src('src/**/*.ts')
    .pipe(preserveNewlines())
    .pipe(ts({
      removeComments: false
    }))
    .pipe(restoreNewlines())
    .pipe(gulp.dest('out'));
});