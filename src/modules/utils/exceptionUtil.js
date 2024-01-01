// 工具类导入
import { NoticeUtil } from "./noticeUtil.js";

/**
 * 异常处理工具类
 */
class ExceptionUtil {
  /**
   * 提示工具类
   */
  __noticeUtil = new NoticeUtil();

  /**
   * 异常处理工具类
   */
  constructor() {}

  /**
   * 统一异常处理
   * @param {string} title
   * @param {string} msg
   * @param {...any} args
   * @returns
   */
  catchErr(title = "", msg = "", ...args) {
    return new Promise((resolve, reject) => {
      this.__noticeUtil.showNotice(title, msg);
      if (args instanceof Array) {
        args.forEach((windowsName) => {
          windowsName.close();
        });
      }

      resolve("OK");
    });
  }
}

export { ExceptionUtil };
