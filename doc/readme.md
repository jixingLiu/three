### launcher 主框架使用说明文档

launcher主框架基于summer前端组件库和vue2.0 jquery bootstarp 。实时监听文件操作并同时刷新浏览器，提高开发效率。

#### 使用命令
1. 全局安装 node、gulp、webpack、smt 
2. 安装node依赖包
3. 运行命令：smt run
4. 打包构建：smt build 

#### 框架实时刷新配置
1. 配置文件所在目录：/src/gulplibs/config.js
2. 打包配置字段package：
    - watch 监听文件，变化后执行相应的操作
        > src: 文件的来源， copy: 复制操作的id，  build：文件打包构建操作的id。  
    - copy 复制文件操作
    - build 将相应文件进行压缩、打包、合并的操作
