// 引入 gulp
var gulp = require('gulp');

// 引入组件

// sass
var sass = require('gulp-sass');
// postcss
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var vmin = require('postcss-vmin');
var cssnext = require('cssnext');
var cssnano = require('cssnano');

var px2rem = require('gulp-px3rem'); // convert px to rem
// browser sync
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
// JS
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

// image
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var cache = require('gulp-cache');
var plumber = require('gulp-plumber');// 检测错误
var gutil = require('gulp-util');// 如果有自定义方法，会用到
// replace
var replace = require('gulp-replace');
// 清空
var clean = require('gulp-clean');
// dist
var dist = '../';
// dev
var dev = '../dev';

function errorHandler(e) {
    // 控制台发声,错误时beep一下
    gutil.beep();
    gutil.log(e);
    this.emit('end');
}

// 清除缓存
gulp.task('cleanCash', function (done) {
    return cache.clearAll(done);
});

// Sass && Postcss
gulp.task('sass', function () {
    var processors = [
        autoprefixer({
            browsers: ['Android >= 4.3', 'iOS >= 9.3', 'Chrome >= 42', 'ff >= 49', 'ie > 8', 'Opera >= 42', 'safari >= 10']
        }),
        cssnext,
        vmin,
        cssnano({zindex: false})
    ];
    return gulp.src(dev + '/sass/!(template-)*.scss')
        .pipe(plumber({errorHandler: errorHandler}))
        .pipe(sass())
        .pipe(postcss(processors))
        .pipe(rename({suffix: '.min'}))
        // .pipe(replace(/..\/..\//g, '//saascore.oss-cn-beijing.aliyuncs.com/custom/'))
        .pipe(gulp.dest(dist + '/css/'))
        .pipe(reload({stream: true}));
});

// px2rem
gulp.task('rem', function () {
    var processors = [
        autoprefixer({
            browsers: ['Android >= 4.3', 'iOS >= 9.3', 'Chrome >= 42', 'ff >= 49', 'ie > 8', 'Opera >= 42', 'safari >= 10']
        }),
        cssnext,
        vmin,
        cssnano({zindex: false})
    ];
    return gulp.src(dev + '/sass/*/template-*.scss')
        .pipe(plumber({errorHandler: errorHandler}))
        .pipe(sass())
        .pipe(px2rem({
            baseDpr: 1,             // base device pixel ratio (default: 2)
            threeVersion: false,    // whether to generate @1x, @2x and @3x version (default: false)
            remVersion: true,       // whether to generate rem version (default: true)
            remUnit: 100,            // rem unit value (default: 75)
            remPrecision: 6         // rem precision (default: 6)
        }))
        .pipe(rename(function (path) {
            path.basename = path.basename.replace(/\.debug/gi, ''); // 去掉编译后文件名中的debug
        }))
        .pipe(postcss(processors))
        .pipe(rename({suffix: '.min'}))
        // .pipe(replace(/..\/..\//g, '//saascore.oss-cn-beijing.aliyuncs.com/custom/'))
        .pipe(gulp.dest(dist + '/css/'))
        .pipe(reload({stream: true}));
});

// browser-sync
gulp.task('browser-sync', function () {
    browserSync.init({
        /*proxy: 'https://portal.taozuike.com', // 后端服务器地址
         serveStatic: ['../../']*/ // 本地文件目录，proxy同server不能同时配置，需改用serveStatic代替
        server: '../'
    });
    browserSync.watch('../*.html').on('change', reload);
});

// js
gulp.task('js', function () {
    return gulp.src(dev + '/js/*.js')
        .pipe(plumber({errorHandler: errorHandler}))
        // .pipe(cache(uglify()))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(dist + '/js'))
        .pipe(reload({stream: true}));

});
// image
gulp.task('image', function () {
    return gulp.src([dev + '/img/*.{png,jpg,jpeg,gif,ico}',dev + '/img/*/*.{png,jpg,jpeg,gif,ico}'])
        .pipe(plumber({errorHandler: errorHandler}))
        .pipe(cache(imagemin({
            use: [pngquant()]
        })))
        .pipe(gulp.dest(dist + '/img'))
        .pipe(reload({stream: true}));
});
// html2ftl
gulp.task('html', function () {
    return gulp.src('../index.html')
        .pipe(plumber({errorHandler: errorHandler}))
        .pipe(replace(/"(baguette\/|swiper\/|css\/|js\/|img\/)/g, '"//saascore.oss-cn-beijing.aliyuncs.com/weiop/demo/$1'))
        .pipe(rename({suffix: '.online'}))
        .pipe(gulp.dest('../'))
        .pipe(reload({stream: true}));
});
// clean
gulp.task('clean', function () {
    return gulp.src([dist + '/img', dist + '/css', dist + '/js', '../*.online.html'])
        .pipe(plumber({errorHandler: errorHandler}))
        .pipe(clean({
            read: false,
            force: true
        }));
});
// watch
gulp.task('watch', function () {
    gulp.watch(dev + '/sass/!(template-)*.scss', ['sass']);
    // gulp.watch(dev + '/sass/*/template-*.scss', ['rem']);
    gulp.watch(dev + '/js/*.js', ['js']);
    gulp.watch(dev + '/img/*.{png,jpg,jpeg,gif,ico}', ['image']);
    gulp.watch(dev + '/img/*/*.{png,jpg,jpeg,gif,ico}', ['image']);
    gulp.watch('../index.html', ['html']);
});
// 默认任务 清空图片、样式、js并重建 运行语句 gulp
gulp.task('default', ['clean'], function () {
    gulp.start('sass', 'rem', 'js', 'image', 'html', 'watch', 'browser-sync');
});
