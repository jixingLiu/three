var express = require("express");
var app = express();
// 设置
app.use(require("method-override")());
app.use(require("errorhandler")());
// session
app.use(require("cookie-parser")());
var session = require("express-session");
app.use(session({ secret: "myapp" }));
// 设置代理
var proxy = require('http-proxy-middleware');
var cfg = require("../config");
for (let a in cfg.proxy) {
    app.use(a, proxy(cfg.proxy[a]));
}
// 路由
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/data", require("./routers/router"));
// 导出一个初始化函数
module.exports = function (root) {
    app.use(express.static(root));
    return app;
}