var gulp = require("gulp");
// 文件操作
var fs = require("fs");
var path = require("path");
// 配置
var config = require("../config.js");
// 顺序执行
var runSequence = require("run-sequence").use(gulp);
// 字符串替换
var replace = require("./gulp-replace.js");
// 工具类
var gutil = require('gulp-util');
// 遍历
var map = require('map-stream');
// 载入插件
var $ = require('gulp-load-plugins')();
var async = require("async")
function funs() {
    var me = this;
    // 无序执行任务
    me.task = function () {
        gulp.task.apply(gulp, arguments);
    }
    me.buildComponent = function (name) {
        var p = config.files.components(name, "package.json");
        if (!fs.existsSync(p)) {
            console.log(p, "is not exist!");
            return;
        }
        var v = JSON.parse(fs.readFileSync(p));
        if (!v.su || !v.su["build-component"]) {
            console.log(name, "is not exist--'build-component'!");
            return;
        }
        v = v.su["build-component"];
        for (var i = 0; i < v.length; ++i) {
            // console.log(config.files.components(name, path.dirname(v[i].dest)))
            gulp.src(config.files.components(name, v[i].name))
                .pipe($.babel({
                    presets: ['es2015'], "plugins": ["transform-runtime", "transform-vue-jsx"],
                }))
                .pipe($.uglify())
                .pipe($.concat(path.basename(v[i].dest)))
                .pipe(gulp.dest(config.files.components(name, path.dirname(v[i].dest))));
        }
    }
    // 顺序执行任务
    me.sqtask = function (name, list) {
        gulp.task(name, function () {
            runSequence(list);
        });
    }
    // 查找文件
    me.find = function (p, callback) {
        var pjs = [];
        gulp.src(p)
            .pipe(map(function (file, cb) {
                pjs.push(file.path);
                cb(null, file);
            }))
            .on("end", function () {
                callback = callback || function () { }
                callback(pjs);
            });
    }
    // 异步顺序执行
    me.asyncArrr = function (arr, fun, cb) {
        async.eachSeries(arr, function (it, callback) {
            fun(it, callback);
        }, cb);
    }
    // 拷贝文件
    me.copy = function (srcFile, dest, callback) {
        gulp.src(srcFile)
            .pipe(gulp.dest(dest))
            .on("end", callback || function () { });
    }
    // 多文件或单文件路径拼接
    me.joinPath = function (base, paths) {
        if (paths instanceof Array) {
            for (var i = 0; i < paths.length; ++i) {
                if (paths[i]) {
                    paths[i] = path.join(base, paths[i]);
                }
            }
            return paths;
        }
        else {
            if (!paths) { return paths; }
            paths = path.join(base, paths);
            return paths;
        }
    }
    // 临时路径
    me.tmp = function (f) {
        var p = config.files.dist("../");
        return path.join(p, f || "");
    }
    me.webpack = function (name, jspath, dist, callback) {
        var cf = Object.create(require("./webpack.config.js"));
        cf.entry = {}
        cf.entry[name] = jspath;
        gulp.src(jspath)
            .pipe($.webpack(cf))
            .pipe(gulp.dest(dist))
            .on("end", callback || function () { });
    }
    me.writeToFile = function (files, mainjs) {
        // 将文件写到一个临时文件中，然后打包
        var s = "";
        files.forEach(function (it) {
            it = it.replace(/\\/g, "/");
            s += "require('" + it + "');\n";
        });
        // 写到components-all.js文件中
        if (fs.existsSync(mainjs)) {
            fs.unlinkSync(mainjs);
        };
        fs.writeFileSync(mainjs, s);
    }
    // 搜索路径并用webpack打包
    me.srcWebpack = function (src, name, tmpJsName, callback) {
        me.find(src, function (files) {
            var mainjs = me.tmp(tmpJsName);
            me.writeToFile(files, mainjs);
            me.webpack(name, mainjs, config.files.dist("/libs/su/js"), function () {
                fs.unlink(mainjs);
                if (callback instanceof Function) {
                    callback();
                }
            })
        })
    }
    // 编译组件
    me.buildComponents = function (cb) {
        // 找到所有的package.json
        // 找到需要拷贝的内容和需要编译的vue
        me.find(config.files.components("/**/package.json"), function (arr) {
            if (arr.length < 1) {
                return;
            }
            var op = { copy: [], build: [] };
            arr.forEach(function (it) {
                var c = JSON.parse(fs.readFileSync(it)).su;
                if (!c) { return; }
                // 取得拷贝和编译的文件
                var cp = path.dirname(it);
                if (c.copy) {
                    c.copy = me.joinPath(cp, (c.copy instanceof Array) ? c.copy : [c.copy]);
                    op.copy = op.copy.concat(c.copy);
                }
                if (c.build) {
                    c.build = me.joinPath(cp, (c.build instanceof Array) ? c.build : [c.build]);
                    op.build = op.build.concat(c.build);
                }
            });
            // 处理拷贝
            me.copy(op.copy, config.files.dist(), function () {
                me.srcWebpack(op.build, "su", "components-all.js", cb);
            });
        })
    }

    me.__bjade = function (src, dest, cb) {
        //console.log(src)
        gulp.src(src)
            .pipe(replace(/jRequire\((.+)\)/g, function (file, s) {
                // 取得组件名称
                var name = s.replace(/jRequire\((.+)\)/g, "$1");
                var p = config.files.components(name);
                if (!fs.statSync(p).isFile()) {
                    // 读取组件入口文件
                    p = config.files.components(name, "package.json");
                    var obj = {};
                    if (fs.existsSync(p)) {
                        obj = JSON.parse(fs.readFileSync(p));
                    }
                    var srcpath = path.dirname(file.path);
                    p = config.files.components(name, obj.main || "index.jade");
                }
                return "include " + path.relative(srcpath, p);
            }))
            .pipe($.jade())
            .pipe(gulp.dest(config.files.dist(dest)))
            .on("end", function () {
                //console.log("end __bjade")
                cb && cb();
            });
    }
    me.__bcsssub = function (src, dest, cb) {
        gulp.src(src)
            .pipe($.if(!config.dev, $.cssmin()))
            //.pipe($.concat(dest))
            .pipe(gulp.dest(config.files.dist(dest)))
            .on("end", function () {
                // console.log("end __bcsssub")
                cb && cb();
            });
    }
    me.__bcss = function (src, dest, cb) {
        if (dest.indexOf(".css") != -1) {
            gulp.src(src)
                .pipe($.if(!config.dev, $.cssmin()))
                .pipe($.concat(path.basename(dest)))
                .pipe(gulp.dest(config.files.dist(path.dirname(dest))))
                .on("end", function () {
                    // console.log("end __bcss")
                    cb && cb();
                });
            return;
        }
        me.__bcsssub(src, dest, cb);
        // me.find(src, function (paths) {
        //     me.asyncArrr(paths, function (it, callback) {
        //         gulp.src(it)
        //             .pipe($.if(!config.dev, $.cssmin()))
        //             .pipe(gulp.dest(config.files.dist(dest)))
        //             .on("end", function () {
        //                 callback();
        //             });
        //     }, cb);
        // })
    }
    me.__bjs = function (src, dest, cb) {
        let go = gulp.src(src);
        let isjs = dest.indexOf(".js") != -1;
        if (isjs) {
            go = go.pipe($.concat(path.basename(dest)));
        }
        go = go.pipe($.babel({
            presets: ['es2015'], "plugins": ["transform-runtime", "transform-vue-jsx"],
        }));
        go = go.pipe($.if(!config.dev, $.uglify({
            mangle: true,//类型：Boolean 默认：true 是否修改变量名
            compress: true,//类型：Boolean 默认：true 是否完全压缩
            preserveComments: 'all' //保留所有注释
        })));
        if (isjs) {
            go = go.pipe(gulp.dest(config.files.dist(path.dirname(dest))))
        } else {
            go = go.pipe(gulp.dest(config.files.dist(dest)));
        }
        go.on("end", function () {
            // console.log("end __bjs")
            cb && cb();
        });
    }
    me.__bvue = function (src, dest, cb) {
        me.find(src, function (files) {
            if (files.length < 1) {
                cb && cb();
                return;
            }
            var uuid = require("node-uuid");
            var mainjs = me.tmp(uuid.v1().replace(/\-/g, "") + ".js");
            me.writeToFile(files, mainjs);
            me.webpack(dest, mainjs, config.files.dist("/js"), function () {
                fs.unlink(mainjs);
                cb && cb();
            });
        });
    }
    me.__bless = function (src, dest, cb) {
        var less = require('gulp-less');
        me.find(config.files.components("/**/src"), function (files) {
            // console.log(src)
            gulp.src(src)
                .pipe(less({
                    paths: files
                }))
                .pipe($.concat(path.basename(dest)))
                .pipe(gulp.dest(config.files.dist(path.dirname(dest))))
                .on("end", function () {
                    cb && cb();
                });
        });
    }
    // 编译code
    me.__toDist = function (src) {
        if (!(src instanceof Array)) {
            return config.files.dist(src);
        }
        var arr = [];
        for (let i = 0; i < src.length; ++i) {
            arr.push(config.files.dist(src[i]));
        }
        return arr;
    }
    me.__toCode = function (src) {
        if (!(src instanceof Array)) {
            return config.files.code(src);
        }
        var arr = [];
        for (let i = 0; i < src.length; ++i) {
            arr.push(config.files.code(src[i]));
        }
        return arr;
    }
    me.__buildCode = function (src, dest, cb) {
        src = me.__toCode((src instanceof Array) ? src : [src]);
        var it = src[0];
        if (/\.jade$/.test(it)) { me.__bjade(src, dest, cb) }
        else if (/\.css$/.test(it)) { me.__bcss(src, dest, cb); }
        else if (/\.js$/.test(it)) { me.__bjs(src, dest, cb) }
        else if (/\.vue$/.test(it)) { me.__bvue(src, dest, cb) }
        else if (/\.less$/.test(it)) { me.__bless(src, dest, cb) }
        else {
            console.log("没找到编译方法：", src, "   ", dest);
            cb && cb();
        }
    }
    // 按格式取得时间
    me.getTime = function (tm) {
        var d = new Date();
        if (tm) {
            d.setTime(tm);
        }
        function p0(n) { return n > 9 ? n : ('0' + n); }
        var s = d.getFullYear() + "-" + p0(d.getMonth() + 1) + "-" + p0(d.getDate()) + " " +
            p0(d.getHours()) + ":" + p0(d.getMinutes());
        return s;
    }
    // 编译指定的配置
    me.buildCode = function (build, copy, cb) {
        // 编译
        me.asyncArrr(build, function (it, callback) {
            me.__buildCode(it.src, it.dest, callback);
        }, function () {
            // 拷贝
            me.asyncArrr(copy, function (it, callback) {
                if (it.same) {
                    me.copy(me.__toCode(it.src), me.__toDist(it.dest), callback);
                } else {
                    me.find(me.__toCode(it.src), function (files) {
                        me.copy(files, me.__toDist(it.dest), callback);
                    })
                }
            }, cb)
        })
    }
    // 重新编译所有code下的配置
    me.rebuildCode = function (cb) {
        console.log(me.getTime(), "start rebuildCode");
        me.buildCode(config.package.build, config.package.copy, function () {
            console.log(me.getTime(), "rebuildCode done");
            cb && cb();
        });
    }
}
module.exports = new funs();