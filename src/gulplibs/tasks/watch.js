var gulp = require("gulp");
// 不用刷新页面的服务连接
var connect = require('gulp-connect');
// 路径
var path = require("path");
// 配置
var config = require("../config.js");
// 通用方法
var funs = require("./funs");
// 监听全部
gulp.task("__watchAll", ["__watchStatic"]);
// 监听静态资源的变化
gulp.task("__watchStatic", function () {
    gulp.watch([config.files.code("/**/*.*")],
        function (file) {
            if (config.rebuilding) {
                return;
            }
            gulp.src(file.path)
                .pipe(connect.reload());
        });
});
// 监听组件的变化
gulp.task("__watchComponents", function () {
    gulp.watch([config.files.components("/**/*.*")], function () {
        config.rebuilding = true;
        funs.buildComponents(function () {
            config.rebuilding = false;
            connect.reload();
        });
    });
});
// 监听业务代码的变化
gulp.task("__watchCode", function () {
    let watch = config.package.watch || [];
    function findarr(src, ids) {
        let arr = [];
        ids.map(function (it) {
            for (let i = 0; i < src.length; ++i) {
                if (src[i].id == it) {
                    arr.push(src[i]);
                    break;
                }
            }
        });
        return arr;
    }
    watch.map(function (it) {
        let src = [];
        it.src.map(function (itsrc) {
            src.push(config.files.code(itsrc));
        })
        gulp.watch(src, function (p) {
            console.log("start build ", p.path);
            let copy = findarr(config.package.copy || [], it.copy || []);
            let build = findarr(config.package.build || [], it.build || []);
            // console.log("build-copy:", build, copy);
            funs.buildCode(build, copy, function () {
                console.log("end build ", p.path);
                connect.reload();
            });
        });
    })
    // 监听view下的模块
    gulp.watch([config.files.code("view/**/*.*")], function (p) {
        // 判断是否为view下的，如果是，则单独编译一个view
        let v = config.files.code("view");
        if (p.path.indexOf(v) == -1) {
            return;
        }
        let arr = p.path.substr(v.length + 1).split(path.sep);
        if (arr.length < 2) { return; }
        arr.length = 2;
        let sub = arr.join(path.sep);
        v = path.join(v, sub);
        // copy
        let copy = [
            { src: path.join("view", sub, "images/**/*.*"), dest: path.join("/view", sub, "images/") },
            { src: path.join("view", sub, "/*.html"), dest: path.join("/view", sub, "/") },
            { src: path.join("view", sub, "/*.json"), dest: path.join("/view", sub, "/") }
        ];
        let build = [
            { src: path.join("view", sub, "/*.js"), dest: path.join("/view", sub, "/") },
            { src: path.join("view", sub, "/*.css"), dest: path.join("/view", sub, "/") },
            { src: path.join("view", sub, "/*.jade"), dest: path.join("/view", sub, "/") },
        ]
        //console.log(build)
        console.log("start build ", sub);
        funs.buildCode(build, copy, function () {
            console.log("end build ", sub);
            connect.reload();
        });
    });
});
// 监听服务代码的变化
gulp.task("__watchServer", function () {
    gulp.watch([config.files.server("/**/*.*")],
        function (file) {
            gulp.src(file.path)
                .pipe(connect.reload());
        });
});
// 编译
gulp.task("__build", function () {
    config.rebuilding = true;
    funs.rebuildCode(function () {
        funs.buildComponents(function () {
            console.log(funs.getTime(), "build all done!");
            config.rebuilding = false;
        });
    });
});
// 编译单个组件
gulp.task("bc", function () {
    if (process.argv.length < 4) {
        return;
    }
    funs.buildComponent(process.argv[3].replace(/-/, ""));
});
// 编译
gulp.task("__buildCode", function () {
    config.rebuilding = true;
    funs.rebuildCode(function () {
        config.rebuilding = false;
    });
});
// 将dist内容拷到build文件夹中
gulp.task("__copy", function () {
    // 拷贝
    funs.copy(config.files.dist("/**/*.*"), config.files.build());
});