
var gulp = require('gulp');
    uglify = require('gulp-uglify');

gulp.task('default', function() {
    gulp.src(['Scripts/flight.js', 
        'Scripts/drone.js', 
        'Scripts/add_controls.js'])
        .pipe(uglify({
            mangle: {except: ['require' ,'exports' ,'module' ,'$']},
            compress: true
        }))
        .pipe(gulp.dest('Scripts/index'))
});

