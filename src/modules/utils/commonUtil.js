// 初始化导入
import { app } from "electron";
// 工具类导入
import { ExceptionUtil } from "./exceptionUtil.js";

/**
 * 通用工具类
 */
class CommonUtil {
  /**
   * 异常工具类
   */
  __exceptionUtil = new ExceptionUtil();

  /**
   * 通用工具类
   */
  constructor() {}

  /**
   * 执行异常捕捉
   * @param {string} title
   * @param {string} msg
   * @param {object} mainWindows
   */
  doCatchErr(title = "", msg = "", mainWindows = null) {
    this.__exceptionUtil
      .catchErr(title, msg, mainWindows)
      .then((res) => {
        app.relaunch({ args: process.argv.slice(1).concat(["--relaunch"]) });
        app.exit(0);
      })
      .catch((err) => {
        console.log("doCatchErr-操作失败", err);
      });
  }

  /**
   * 去除首尾指定字符串
   * @param {string} str
   * @param {string} char
   */
  trimChar(str = "", char = "") {
    while (str.startsWith(char)) {
      str = str.slice(char.length);
    }

    while (str.endsWith(char)) {
      str = str.slice(0, -char.length);
    }

    return str;
  }

  /**
   * 格式化换行
   * @param {string} str
   */
  formatWrap(str = "") {
    if (str && typeof str === "string") {
      return str.replaceAll("\n", "");
    }

    return str;
  }

  /**
   * 格式化npm ls -g的结果
   * @param {string} str
   */
  formatNpmLs(str = "") {
    str = this.formatWrap(str);
    str = str.replaceAll("─", "").replaceAll("├", "").replaceAll("└", "").replaceAll("--", "").replaceAll("+", "").replaceAll("`", "");
    return str;
  }

  /**
   * 获取字符串中指定字符的位置
   * @param {string} str
   * @param {string} char
   */
  findCharacterPosition(str = "", char = "") {
    let positions = [];
    let pos = str.indexOf(char);
    while (pos !== -1) {
      positions.push(pos);
      pos = str.indexOf(char, pos + 1);
    }

    return positions;
  }

  /**
   * 格式化执行结果
   * @param {object} cmdResult
   */
  formatResult(cmdResult = null) {
    if (!cmdResult) {
      return {
        success: false,
        result: "",
      };
    }

    if (!cmdResult.success) {
      return {
        success: false,
        result: this.formatWrap(`${cmdResult.errorMsg}`),
      };
    }

    return {
      success: true,
      result: this.formatWrap(`${cmdResult.resultMsg}`),
    };
  }
}

export { CommonUtil };
