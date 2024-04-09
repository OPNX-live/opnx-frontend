const readline = require("readline");
const fs = require("fs");
const path = "./src/scenes/";
let directoryName = "Index";
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
rl.question("文件名：", (name) => {
    fs.mkdir(path + name, (err) => {
        if (err) console.log("创建目录失败:", err);
        rl.question("组件名(首字母大写)：", (componentName) => {
            directoryName = componentName ? componentName : directoryName;
            fs.readFile("./scripts/index.tsx", (err, data) => {
                if (err) console.log(err);
                let str = data
                    .toString()
                    .replace(/Name/g, directoryName)
                    .replace(/index.scss/, directoryName + ".scss");
                fs.writeFile(
                    path + name + "/" + directoryName + ".tsx",
                    str,
                    (err) => {
                        if (err) console.log("创建文件失败", err);
                        rl.close();
                    }
                );
            });
            fs.writeFile(
                path + name + `/${directoryName.toLowerCase()}.scss`,
                "",
                (err) => {
                    if (err) console.log("创建style文件失败:", err);
                }
            );
        });
    });
});