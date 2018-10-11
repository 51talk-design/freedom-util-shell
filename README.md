### freedom-middleware-shell

简单的shell命令执行中间件，可支持在mac、linux、windows平台下使用

### 如何使用

- 安装

  ```
  cnpm/npm install freedom-middleware-shell --save
  ```

- 使用demo

  ```js
  const shell = require("freedom-middleware-shell")();

  (async function () {
    let result = await shell.execCmd("git log", false);
    let regExp = /commit\s*(((?!Author).)+)Author/gm;
    if (regExp.test(result)) {
      console.log("============" + RegExp.$1 + "============");
    }
  })();
  ```

### API

- 构造器

  ```
  构造器提供了一个option对象，提供以下参数
  	shellCmd：指定shell命令的执行程序，比如：linux系统下的sh程序，windows系统下的cmd.exe程序
  ```

- execCmd

  ```
  shell命令执行方法，该方法提供2个参数
  	shellCmds:string|Array<string>类型 单个的shell命令，或者多个shell命令
  	isOutput：boolean类型，是否输出shell执行结果，true为输出，false为不输出，默认值为true，可选
  	opts：object类型，可选参数，该参数提供以下值，可选
  		cwd:string 类型，shell执行的目录，请参考node中child_process的spawn提供的可选参数
    flags:Array<string> 类型，指定的系统操作符，可选
  	
  ```

  ​