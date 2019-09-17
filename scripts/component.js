const fs = require("fs")
const path = require("path")
const glob = require("glob")
const moment = require("moment")
const chalk = require('chalk');
const _ = require("lodash");

const builtFilename = "component";
const includes = ['@sparkpost/matcbhox'];

glob(path.join(__dirname, "../../2web2ui/src/**/*.js"), {
  ignore: ['**/__func__/**', '**/__testHelpers__/**', '**/tests/**']
}, (err, files) => {
  const json = files.reduce((acc, file) => {
    const content = fs.readFileSync(file, "utf8");
    const fileName = file.split('/').pop();
    let results = {};

    content.split('\n').forEach((line) => {
      if (!line.includes('@sparkpost/matchbox')) {
        return;
      }

      const parts = line.split(/({|})+/);
      parts.splice(-2,2);
      parts.splice(0, 2);

      const components = parts.join().trim().split(',');

      components.forEach((component) => {
        const key = component.split('as').shift().trim();

        if (key) {
          results = {
            ...results,
            [key]: {
              component: key,
              count: acc[key] ? acc[key].count + 1 : 1,
              files: acc[key] ? [ ...acc[key].files, fileName ] : [fileName]
            }
          }
        }
      });
    });

    return {...acc, ...results};
  }, {});

  const ordered = _.orderBy(_.toArray(json), ['count'], ['desc']);

  fs.writeFileSync(path.join(__dirname, "../src/raw-data/components.json"), JSON.stringify(ordered));

  ordered.forEach(({ component, count }) => {
    console.log(chalk`{blue ${component}} {rgb(100,100,100) (${count})}`)
  })
  console.log(chalk.green.bold(`Component usage generated (${Object.keys(ordered).length} found)\n`))
});
