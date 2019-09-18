const fs = require("fs")
const path = require("path")
const glob = require("glob")
const moment = require("moment")
const chalk = require('chalk');

const DATE = process.argv.pop();

const builtFilename = "size"
const formattedDate = moment(DATE).format("YYYY-MM-DD")

let currentContent = JSON.parse(fs.readFileSync(path.join(__dirname, "../src/raw-data/size.json"), "utf8"));
currentContent = { ...currentContent, [formattedDate]: {} };

const cssFiles = glob.sync(path.join(__dirname, "../../2web2ui/src/**/*.scss"), {});
const css = cssFiles.filter((file) => !file.includes("test")).reduce((acc, file) => {
  const content = fs.readFileSync(file, "utf8")
  return acc + content.split("\n").length;
}, 0);

currentContent[formattedDate] = { css };

const jsFiles = glob.sync(path.join(__dirname, "../../2web2ui/src/**/*.js"), {});
const js = jsFiles.filter((file) => !file.includes("test")).reduce((acc, file) => {
  const content = fs.readFileSync(file, "utf8")
  return acc + content.split("\n").length;
}, 0);

currentContent[formattedDate] = { ...currentContent[formattedDate], js };
fs.writeFileSync(path.join(__dirname, `../src/raw-data/${builtFilename}.json`), JSON.stringify(currentContent));

console.log(chalk.green(`✅  Size calculated for ${formattedDate}`))
