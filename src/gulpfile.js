// 在此声名命令行的任务，任务的实现在gulplibs\tasks\
var c = require("./gulplibs/tasks/funs.js");
// 默认调试状态：编译所有文件，启动服务，监听文件，打开浏览器, "__open"
c.task("default", ["__connect", "__watchAll"]);
// 发布状态：只启动服务，不做监听
c.task("server", ["__connect"]);
// 编译命令：编译所有文件并拷贝到build文件夹中
c.task("buildcode", ["__buildCode"]);
// 编译命令：编译所有文件并拷贝到build文件夹中
c.sqtask("build", ["__build"]);//, "__copy"

// 递归载入所有./gulplibs/tasks下的任务(*.js)
var requireDir = require("require-dir");
requireDir("./gulplibs/tasks", { recurse: true });