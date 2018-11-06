const shell = require("../index")();

(async function () {
  let result = await shell.execCmd("git log", false);
  //D:\\dev-tool\\wechat-dev\\微信web开发者工具\\cli.bat -o
  //commit c046f0e427b852aaeede5359a16230871c003f3a
  //       c046f0e427b852aaeede5359a16230871c003f3a

  let regExp = /commit\s*(((?!Author).)+)Author/gm;
  if (regExp.test(result)) {
    console.log("============" + RegExp.$1 + "============");
  }
})();