const shell = require("../index")();

(async function () {
  let result = await shell.execCmd("cnpm install vue@^2.5.11", true);
  //D:\\dev-tool\\wechat-dev\\微信web开发者工具\\cli.bat -o
  //commit c046f0e427b852aaeede5359a16230871c003f3a
  //       c046f0e427b852aaeede5359a16230871c003f3a

  let regExp = /commit\s*(((?!Author).)+)Author/gm;
  if (regExp.test(result)) {
    console.log("============" + RegExp.$1 + "============");
  }
})();