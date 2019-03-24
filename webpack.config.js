const path = require("path");
const fs = require("fs");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const entry = [
    {
        name: "index", entry: "./src/index.ts", exportName: "index"
    }
];
const entryObj = {};
const htmlPlugins = [];
const appDirectory = fs.realpathSync(process.cwd());
const relativePath = relativeUrl => {
    return path.resolve(__dirname, `./src/${relativeUrl}`);
}
const resolveApp = relativePath => path.resolve(appDirectory, relativePath); const isDev = process.env.NODE_ENV == "development"; const paths = {
    appPackageJson: resolveApp("package.json"), appPublic: resolveApp("public"), appBuild: resolveApp("bin"), appHtml: resolveApp("public/index.html"), appNodeModules: resolveApp('node_modules'),
};
entry.map(item => {
    entryObj[item.name] = [require.resolve("webpack-dev-server/client") + "?/",
    require.resolve("webpack/hot/dev-server"),
    item.entry,
    ];
    htmlPlugins.push(new HtmlWebpackPlugin({
        inject: true, template: item.template || paths.appHtml, filename: `${item.exportName || item.name}.html`, chunks: [item.name]
    }));
});
module.exports = {
    config: {
        mode: isDev ? "development" : "production",
        entry: isDev ? entryObj : "./src/index.ts",
        devtool: isDev ? "inline-source-map" : "",
        module: {
            rules: [
                {
                    test: /\.ts$/, use: "ts-loader", exclude: /node_modules/
                }
            ]
        },
        resolve: {
            modules: ['node_modules'
            ],
            extensions: ['.ts', '.js', '.json'],
            alias: {
                KCommon: relativePath('common'),
                KUi: relativePath('ui'),
                KPages: relativePath('pages'),
            }
        },
        output: {
            filename: "js/index.js", pathinfo: isDev,
            // 告诉 webpack 在 bundle 中引入「所包含模块信息」的相关注释，开发环境用
            publicPath: "/",
            path: path.resolve(__dirname, "bin"),
            devtoolModuleFilenameTemplate: isDev ? () => { } : info => path.relative(paths.appSrc, info.absoluteResourcePath).replace(/\\/g, "/")
        }, plugins: [
            // ...htmlPlugins,// 当开启 HMR 的时候使用该插件会显示模块的相对路径，建议用于开发环境。作用没理解~
            // new webpack.NamedModulesPlugin(),
            // 区别开发模式和发布模式的全局变量
            // new webpack.DefinePlugin(env.stringified),
            // This is necessary to emit hot updates (currently CSS only):new webpack.HotModuleReplacementPlugin(),
            // 在 npm install 新的依赖后自动刷新
            // new WatchMissingNodeModulesPlugin(paths.appNodeModules),
            // 优化 moment.js 库的体积，https://github.com/jmblog/how-to-optimize-momentjs-with-webpacknew 
            webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)],
        // 将一些在浏览器不起作用，但是引用到的库置空
        node: { dgram: "empty", fs: "empty", net: "empty", tls: "empty" }
    }, paths
};