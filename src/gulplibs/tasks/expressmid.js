// express的中间件
module.exports = function (connect, options) {
    var ser = require('../server/server.js');
    var app = ser(options.root);
    app.use(require('connect-livereload')());
    return [connect(app)];
};
