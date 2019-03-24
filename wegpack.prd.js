"use strict";
process.env.NODE_ENV = "production";
process.on("unhandledRejection", err => { throw err; });
const chalk = require("chalk");
const webpack = require("webpack");
const fs = require("fs");
const path = require("path");
const config = require("./webpack.config").config;
const paths = require("./webpack.config").paths;
const formatWebpackMessages = require("react-dev-utils/formatWebpackMessages");
const FileSizeReporter = require("react-dev-utils/FileSizeReporter");
const printBuildError = require("react-dev-utils/printBuildError");
const fsSync = require("fs-sync");
const measureFileSizesBeforeBuild = FileSizeReporter.measureFileSizesBeforeBuild;
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild;
measureFileSizesBeforeBuild(paths.appBuild).then(previousFileSizes => {
    // Remove all content but keep the directory so that
    // if you're in it, you don't end up in Trash
    emptyDir(paths.appBuild);
    // Merge with the public folder
    copyPublicFolder();
    // Start the webpack buildreturn
    build(previousFileSizes);
}).then(({ stats, previousFileSizes, warnings }) => {
    if (warnings.length) {
        console.log(chalk.yellow("Compiled with warnings.\n"));
        console.log(warnings.join("\n\n"));
        console.log("\nSearch for the " + chalk.underline(chalk.yellow("keywords")) + " to learn more about each warning.");
        console.log("To ignore, add " + chalk.cyan("// eslint-disable-next-line") + " to the line before.\n");
    }
    else {
        console.log(chalk.green("Compiled successfully.\n"));
    }
}, err => {
    console.log(chalk.red("Failed to compile.\n"));
    printBuildError(err); process.exit(1);
});
// Create the production build and print the deployment instructions.
function build(previousFileSizes) {
    console.log("Creating an optimized production build...");
    const compiler = webpack(config);
    return new Promise((resolve, reject) => {
        // Create a webpack compiler that is configured with custom messages.
        compiler.run((err, stats) => {
            if (err) {
                return reject(err);
            }
            const messages = formatWebpackMessages(stats.toJson({}, true));
            if (messages.errors.length) {
                // Only keep the first error. Others are often indicative
                // of the same problem, but confuse the reader with noise.
                if (messages.errors.length > 1) { messages.errors.length = 1; }
                return reject(new Error(messages.errors.join("\n\n")));
            }
            if (process.env.CI && (typeof process.env.CI !== "string" || process.env.CI.toLowerCase() !== "false") && messages.warnings.length) {
                console.log(chalk.yellow("\nTreating warnings as errors because process.env.CI = true.\n" + "Most CI servers set it automatically.\n"));
                return reject(new Error(messages.warnings.join("\n\n")));
            }
            return resolve({ stats, previousFileSizes, warnings: messages.warnings });
        });
    });
}

function copyPublicFolder() {
    fsSync.copy(paths.appPublic, paths.appBuild, { dereference: true, filter: file => file !== paths.appHtml });
}

function emptyDir(fileUrl) {
    if (!fs.existsSync(fileUrl)) {
        fs.mkdirSync(fileUrl)
    }
    var files = fs.readdirSync(fileUrl);
    //读取该文件夹
    files.forEach(function (file) {
        var stats = fs.statSync(fileUrl + "/" + file);
        if (stats.isDirectory()) { emptyDir(fileUrl + "/" + file); }
        else { fs.unlinkSync(fileUrl + "/" + file); }
    });
}