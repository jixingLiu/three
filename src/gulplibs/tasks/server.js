var gulp = require("gulp");
// 不用刷新页面的服务连接
var connect = require("gulp-connect");
// 配置
var config = require("../config.js");
// 路径
var path = require("path");
gulp.task("__dev", function () {
    config.dev = true;
})
// 启动服务
gulp.task("__connect", function () {
    var option = {
        root: config.server.staticPath,
        livereload: true,
        port: config.server.port,
        middleware: require("./expressmid.js")
    };
    return connect.server(option);
});
// 打开浏览器
gulp.task("__open", function () {
    var open = require('gulp-open');
    var option = {
        uri: config.server.url(),
        app: config.server.browser
    };
    gulp.src(config.server.homepage)
        .pipe(open(option));
});