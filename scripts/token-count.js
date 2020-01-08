const fs = require("fs")
const path = require("path")
const glob = require("glob")
const moment = require("moment")

const DATE = process.argv.pop()

const builtFilename = "token-count"
const formattedDate = moment(DATE).format("YYYY-MM-DD")
const shouldWriteFile = moment(DATE).isSame(moment(), "month")

let currentContent = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../src/raw-data/token-count-raw.json"),
    "utf8"
  )
)
currentContent = { ...currentContent, [formattedDate]: {} }

const cssIncludes = [
  "color:",
  "fill:",
  "border:",
  "border-",
  "background:",
  "stroke:",
  "margin",
  "padding",
  "z-index:",
  "font-size",
  "font-family",
]

const cssExcludes = [
  "color(",
  "border-radius(",
  "border: none",
  "map-get",
  "spacing(",
  "z-index(",
  "font-size(",
  "line-height(",
  "font-family(",
  "-smoothing",
  "-weight",
  "border-style:",
  "@import",
]

glob(path.join(__dirname, "../../2web2ui/src/**/*.scss"), {}, (err, files) => {
  const json = files.reduce((acc, file) => {
    const content = fs.readFileSync(file, "utf8")

    const lines = content.split("\n").reduce((acc, line, i) => {
      const shouldCheck = () =>
        cssIncludes.reduce(
          (acc, include) => line.includes(include) || acc,
          false
        )
      const isNotToken = () =>
        cssExcludes.reduce(
          (acc, excludes) => line.includes(excludes) || acc,
          false
        )

      if (shouldCheck() && !isNotToken()) {
        acc.push({
          file: file.split("/").pop(),
          code: line.trim(),
          line: i,
        })
      }

      return acc
    }, [])

    if (lines.length) {
      return [...acc, ...lines]
    }

    return acc
  }, [])

  currentContent[formattedDate] = { css: json.length }

  if (shouldWriteFile) {
    fs.writeFileSync(
      path.join(
        path.join(__dirname, "../src/raw-data"),
        `${builtFilename}-css-now.json`
      ),
      JSON.stringify({ date: formattedDate, data: json })
    )
  }
  console.log(
    `✅  CSS Tokenizables for ${formattedDate} (${json.length} found)`
  )
})

const jsIncludes = [` '#`, `="#`]
const jsExcludes = ["PropTypes", "orange", "blue", "fill: {"]

glob(path.join(__dirname, "../../2web2ui/src/**/*.js"), {}, (err, files) => {
  const json = files
    .filter(
      file =>
        !file.includes("test") &&
        !file.includes("Icon.js") &&
        !file.includes("/images/")
    )
    .reduce((acc, file) => {
      const content = fs.readFileSync(file, "utf8")

      const lines = content.split("\n").reduce((acc, line, i) => {
        const shouldCheck = () =>
          jsIncludes.reduce(
            (acc, include) => line.includes(include) || acc,
            false
          )
        const isNotToken = () =>
          jsExcludes.reduce(
            (acc, excludes) => line.includes(excludes) || acc,
            false
          )

        if (shouldCheck() && !isNotToken()) {
          acc.push({
            file: file.split("/").pop(),
            code: line.trim(),
            line: i,
          })
        }

        return acc
      }, [])

      if (lines.length) {
        return [...acc, ...lines]
      }

      return acc
    }, [])

  currentContent[formattedDate] = {
    ...currentContent[formattedDate],
    js: json.length,
  }
  fs.writeFileSync(
    path.join(path.join(__dirname, "../src/raw-data"), `token-count-raw.json`),
    JSON.stringify(currentContent)
  )

  if (shouldWriteFile) {
    fs.writeFileSync(
      path.join(
        path.join(__dirname, "../src/raw-data"),
        `${builtFilename}-js-now.json`
      ),
      JSON.stringify({ date: formattedDate, data: json })
    )
  }
  console.log(
    `✅  JS Tokenizables for ${formattedDate} (${json.length} found)\n`
  )
})
