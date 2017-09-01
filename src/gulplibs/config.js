var path = require("path");
var config = {
    // 代理转发信息配置
    proxy: {
        '/minierp': { target: 'http://trunk.minierp.hhwy.org', changeOrigin: true },
        '/fileservice': { target: 'http://file.hhwy.org', changeOrigin: true },
        '/reportservice': { target: 'http://test.rep.365grid.cn', changeOrigin: true }
    },
    // 服务器信息
    server: {
        // 端口
        port: 8888,
        // 主机地址
        host: "http://localhost",
        // 浏览器类型
        browser: "chrome", // iexplore
        // 主页地址的物理路径
        homepage: path.join(__dirname, "../dist/index.html"),
        // 静态服务目录
        staticPath: path.join(__dirname, "../code/"),
        // 取得整体网址
        url: function() {
            var u = config.server.host;
            if (config.server.port) {
                u += ":" + config.server.port;
            }
            return u;
        }
    },
    // 是否为开发版
    dev: false,
    // 是否正在编译
    rebuilding: false,
    // 打包配置
    package: {
    },
    // 文件路径
    files: {
        // 服务路径
        server: function() {
            var v = [__dirname, "./server"];
            for (var i = 0; i < arguments.length; ++i) { v.push(arguments[i]) }
            return path.join.apply(path, v);
        },
        // 组件路径
        components: function() {
            var v = [__dirname, "../components/"];
            for (var i = 0; i < arguments.length; ++i) { v.push(arguments[i]) }
            return path.join.apply(path, v);
        },
        // 业务代码路径
        code: function(file) {
            var v = [__dirname, "../code/"];
            for (var i = 0; i < arguments.length; ++i) { v.push(arguments[i]) }
            return path.join.apply(path, v);
        },
        // 调试时生成的静态文件路径
        dist: function(file) {
            var v = [__dirname, "../dist/"];
            for (var i = 0; i < arguments.length; ++i) { v.push(arguments[i]) }
            return path.join.apply(path, v);
        },
        // 发布后静态文件的路径
        build: function(file) {
            var v = [__dirname, "../../build/"];
            for (var i = 0; i < arguments.length; ++i) { v.push(arguments[i]) }
            return path.join.apply(path, v);
        }
    }
}
module.exports = config;