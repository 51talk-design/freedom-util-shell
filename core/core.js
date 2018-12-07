"use strict";
const spawn = require('child_process').spawn;
const utils = require("heibao-utils");
const path = require("path");
const os = require("os");
const uuidv1 = require('uuid/v1');
const fs = require("fs");
const mkdirp = require("mkdirp");

/**
 * 执行shell
 * @class
 */
class Shell {

  /**
   * 构造器，初始化需要相关信息
   * @param {object} opts 可选配置项
   * {
   *  shellCmd:"指定系统shell执行程序"
   * }
   */
  constructor(opts) {
    opts = opts || {};
    let platformInfo = os.platform();
    this.platform = platformInfo || "win32";
    this.shellCmd = "cmd.exe";
    //默认的命令提示符
    this.flags = this.platform === 'win32' ? ['/d', '/s', '/c'] : ['-c'];
    if (this.platform === 'darwin') {
      this.shellCmd = opts.shellCmd || '/bin/bash';
    } else if (this.platform === 'win32') {
      this.shellCmd = opts.shellCmd || 'cmd.exe';
    } else {
      this.shellCmd = opts.shellCmd || '/bin/sh';
    }
  }

  /**
   * 获取spawn
   * @param {boolean} isPty true为使用pty进程解析
   * @return {object} 返回命令解析的spawn
   */
  getSpawn(isPty) {
    //if (isPty) return require("ptyw.js").spawn;
    return spawn;
  }

  /**
   * 处理要执行的命令字符串
   * @param {string} script 
   * @return {string} 返回处理的命令
   */
  handleScript(script) {
    if (this.platform == "win32") {
      let characterRegExp = /\^{1}/gm;
      if (characterRegExp.test(script)) {
        script = script.replace(/\^/gm, "^^^^");
      }
    }
    return script;
  }

  /**
   * 生成批处理shell脚步文件，比如: .bat、.sh
   * @private 内部私有方法
   * @param {string | Array} shellCmds  要执行的shell脚本，可以是数组
   * @param {object} opts  执行shell的额外参数，预留
   * @return {string} 返回要执行的shell 命令字符串以及生成的.bat|.sh存储路径
   */
  _generateTempCmdFile(shellCmds, opts) {
    let _this = this;
    if (utils.isArray(shellCmds) && shellCmds.length > 1) {
      shellCmds = shellCmds.map(function (item) {
        let script = _this.handleScript(item);
        if (_this.platform == "win32") {
          let regExp = /^\/([a-zA-Z])\//gi;
          if (regExp.test(script)) {
            let dir = RegExp.$1 + ":";
            script = script.replace(/^\/([a-zA-Z])\//gi, "");
            script = path.join(dir, script);
          }
          return `call ${script}`;
        }
        else return `${script}\r\n`;
      });
      shellCmds = shellCmds.join(os.EOL);
    } else {
      if (utils.isArray(shellCmds)) shellCmds = shellCmds[0];
      let regExp = /^\/([a-zA-Z])\//gi;
      if (regExp.test(shellCmds)) {
        let dir = RegExp.$1 + ":";
        shellCmds = shellCmds.replace(/^\/([a-zA-Z])\//gi, "");
        shellCmds = path.join(dir, shellCmds);
      }
      shellCmds = _this.handleScript(shellCmds);
      return shellCmds;
    }
    let fileExtname = this.platform == "win32" ? "bat" : "sh";
    let tempDir = path.normalize(path.join(os.homedir(), "/.freedom/"));
    if (!fs.existsSync(tempDir)) mkdirp.sync(tempDir);
    let tempFilePath = path.normalize(path.resolve(tempDir, `${uuidv1()}.${fileExtname}`));
    fs.writeFileSync(tempFilePath, shellCmds);
    if (this.platform !== "win32") fs.chmodSync(tempFilePath, '777');
    return tempFilePath;
  }

  /**
   * 执行shell命令 "ptyw.js": "^0.4.1",
   * @param {string | Array} shellCmds 要执行的shell脚本，可以是shell命令数组
   * @param {boolean} isOutput 是否输出命令执行结果文本，默认为输出
   * @param {object} opts 执行shell的额外参数，比如：cwd：shell执行的目录
   *  {
   *    cwd:"",
   *    pty:true
   *  }
   * @param {Array<string>} flags 命令提示符
   * @return {string} 返回执行命令后所得到的结果
   */
  execCmd(shellCmds, isOutput = true, opts = null, flags = null) {
    let _this = this;
    opts = opts || {};
    opts.cwd = opts.cwd || process.cwd();
    let args = flags || [];
    opts = Object.assign(opts, {
      windowsVerbatimArguments: this.platform == "win32",
      encoding: "utf-8"
    });
    let isPty = false;//opts.pty == false ? false : true;
    let spawn = this.getSpawn(isPty);
    return new Promise(function (resolve, reject) {
      let buffer = [];
      let flags = [].concat(_this.flags);
      let shellCmdFile = _this._generateTempCmdFile(shellCmds);
      flags.push(shellCmdFile);
      let shellCmdArgs = flags.concat(args);
      let sp = spawn(_this.shellCmd, shellCmdArgs, opts);
      sp.stdout.on('data', function (data) {
        if (!data || data.length < 1) return;
        buffer.push(data);
        if (isOutput) process.stdout.write(data);
      });

      sp.stderr.on('data', function (data) {
        if (!data || data.length < 1) return;
        buffer.push(data);
        if (isOutput) process.stdout.write(data);
      });

      sp.on('exit', function (code) {
        if (code > 0) reject(`invoke shell command happen Error, exit ${code}`);
        if (fs.existsSync(shellCmdFile) && shellCmdFile.indexOf(os.homedir()) > -1)
          fs.unlink(shellCmdFile, () => { });
        resolve(buffer.join('').replace(/(\r\n|\r|\n)/gi, ""));
      });
    });
  }
}

module.exports = Shell;