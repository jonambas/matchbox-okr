const fs = require('fs');
const path = require('path');
const glob = require('glob');
const moment = require('moment');

const builtFilename = 'token-count';

const includes = [
  'color:',
  'fill:',
  'border:',
  'border-',
  'background:',
  'stroke:',
  'margin',
  'padding',
  'z-index:',
  'font-size',
  'font-family'
];

const excludes = [
  'color(',
  'border-radius(',
  'border: none',
  'map-get',
  'spacing(',
  'z-index(',
  'font-size(',
  'line-height(',
  'font-family(',
  '-smoothing',
  '-weight',
  'border-style:',
  '@import'
];

let json;

glob(path.join(__dirname, '../../2web2ui/src/**/*.scss'), {}, (err, files)=>{
  json = files.reduce((acc, file) => {
    const content = fs.readFileSync(file, 'utf8');

    const lines = content.split('\n').reduce((acc, line, i) => {
      const shouldCheck = () => includes.reduce((acc, include) => line.includes(include) || acc, false);
      const isNotToken = () => excludes.reduce((acc, excludes) => line.includes(excludes) || acc, false);

      if (shouldCheck() && !isNotToken()) {
        acc.push({
          file: file.split('/').pop(),
          css: line.trim(),
          line: i
        });
      }

      return acc;
    }, []);

    if (lines.length) {
      return [...acc, ...lines];
    }

    return acc;
  }, []);

  const date = moment().format('YYYY-MM-DD');
  const toWrite = { date, data: json };

  fs.writeFileSync(path.join(path.join(__dirname, '../src/raw-data'), `${builtFilename}-${date}.json`), JSON.stringify(toWrite));
  console.log('✅  Tokenizables generated')
});
