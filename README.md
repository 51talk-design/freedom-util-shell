### freedom-util-shell

简单的shell命令执行工具，可支持在mac、linux、windows平台下使用

[![npm](https://img.shields.io/npm/l/freedom-util-shell.svg)](LICENSE)
[![NPM Version](https://img.shields.io/npm/v/freedom-util-shell.svg)](https://www.npmjs.com/package/freedom-util-shell)
[![npm](https://img.shields.io/npm/dt/freedom-util-shell.svg)](https://www.npmjs.com/package/freedom-util-shell)

### 如何使用

- 安装

  ```
  cnpm/npm install freedom-util-shell --save
  ```

- 使用demo

  ```js
  const shell = require("freedom-util-shell")();

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

### 版本更新说明

- 1.0.2
  1. fixed在执行完指定目录下的命令的时候，会删除此命令的bug
- 1.0.3
  1. fixed执行命令编码的问题，指定为utf-8
  2. 指定命令执行路径
  3. windows下，指定shell进程，隐式调用cmd.exe
- 1.0.5
  1. fixed在指定命令执行目录的bug
- 1.0.6
  1. fixed连续执行命令出现的bug
- 1.0.7
  1. fixed在window下执行带有 ^ 这种符号的bug
- 1.0.8
  1. fixed执行多个命令，即shellCmds为Array<string>类型时，mac系统下无法执行的bug
- 1.0.9
  1. fixed在windows下面执行指定绝对路径【**/d/dev-tool/cli.bat**】的命令失败的bug

### 备注

**建议node > 8.x.x版本**

### 请参考test目录测试该项目

  ​
