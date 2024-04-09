// require("dotenv").config();
const fs = require("fs");
const API_TOKEN = "";
const APP_ID = 329395;
const exec = require("child_process").exec;
let outputPath = "src/locale";
const outputArgIndex = process.argv.findIndex((arg) => arg === "-o");
if (outputArgIndex !== -1) {
  outputPath = process.argv[outputArgIndex + 1];
}
(async () => {
  try {
    let languages = await new Promise((resolve, reject) => {
      exec(
        `curl -X POST https://api.poeditor.com/v2/languages/list -d api_token="${API_TOKEN}" -d id="${APP_ID}"`,
        (err, stdout) => {
          const response = JSON.parse(stdout);

          if (err) return reject(err);

          if (response.response.status === "fail")
            return reject(response.response.message);

          resolve(response.result);
        }
      );
    });
    languages = await Promise.all(
      languages.languages.map((language) => {
        return new Promise((resolve, reject) => {
          exec(
            `curl -X POST https://api.poeditor.com/v2/projects/export -d api_token="${API_TOKEN}" -d id="${APP_ID}" -d language="${language.code}" -d type="json"`,
            (err, stdout) => {
              if (err) return reject(err);
              language.url = JSON.parse(stdout).result.url;
              resolve(language);
            }
          );
        });
      })
    );
    fs.exists(outputPath, function (exists) {
      if (!exists) {
        fs.mkdir(outputPath, (err) => {
          if (err) {
            console.log("创建目录失败:", err);
          }
        });
      }
    });
    let length = languages.length;
    let languageConvert = {};
    for (let i = 0; i < length; i++) {
      // eslint-disable-next-line no-loop-func
      exec(`curl  GET ${languages[i].url}`, (err, stdout) => {
        if (err) console.log("下载失败:", err);
        stdout = JSON.parse(stdout);
        stdout.map((i) => {
          languageConvert = {
            ...languageConvert,
            [i.term]: i.definition ? i.definition : "",
          };
        });
        if (languages[i].code === "zh-CN" || languages[i].code === "en") {
          fs.writeFile(
            `${outputPath}/${
              languages[i].code === "zh-CN" ? "zh" : languages[i].code
            }.json`,
            JSON.stringify(languageConvert, null, "\n"),
            (err) => {
              if (err) console.log("写入失败，失败问题:", err);
            }
          );
        }
      });
    }
  } catch (error) {
    console.error(error);
  }
})();
