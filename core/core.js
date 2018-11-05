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
   * 生成批处理shell脚步文件，比如: .bat、.sh
   * @private 内部私有方法
   * @param {string | Array} shellCmds  要执行的shell脚本，可以是数组
   * @param {object} opts  执行shell的额外参数，预留
   * @return {string} 返回要执行的shell 命令字符串以及生成的.bat|.sh存储路径
   */
  _generateTempCmdFile(shellCmds, opts) {
    if (utils.isArray(shellCmds)) {
      shellCmds = shellCmds.map(function (item) {
        return `call ${item}`;
      });
      shellCmds = shellCmds.join(os.EOL);
    } else {
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
   * 执行shell命令
   * @param {string | Array} shellCmds 要执行的shell脚本，可以是shell命令数组
   * @param {boolean} isOutput 是否输出命令执行结果文本，默认为输出
   * @param {object} opts 执行shell的额外参数，比如：cwd：shell执行的目录
   *  {
   *    cwd:""
   *  }
   * @param {Array<string>} flags 命令提示符
   * @return {string} 返回执行命令后所得到的结果
   */
  execCmd(shellCmds, isOutput = true, opts = null, flags = null) {
    let _this = this;
    opts = opts || {};
    let args = flags || [];
    return new Promise(function (resolve, reject) {
      let buffer = [];
      let shellCmdFile = _this._generateTempCmdFile(shellCmds);
      _this.flags.push(shellCmdFile);
      let shellCmdArgs = _this.flags.concat(args);
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