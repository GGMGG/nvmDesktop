// 工具类导入
import { CommonUtil } from "./commonUtil.js";
import { CmdUtil } from "./cmdUtil.js";

/**
 * npm工具类
 */
class NpmUtil {
  /**
   * 通用工具类
   */
  __commonUtil = new CommonUtil();

  /**
   * cmd工具类
   */
  __cmdUtil = new CmdUtil();

  /**
   * npm工具类
   */
  constructor() {}

  /**
   * 获取npm全局依赖
   */
  getNpmGlobalList() {
    const cmdResult = this.__cmdUtil.execCmd("npm ls -g --depth 0");
    if (cmdResult.success && cmdResult.resultMsg) {
      let npmList = [];
      const clearWrap = this.__commonUtil.trimChar(cmdResult.resultMsg, "\n").trim();
      const npmArr = clearWrap.split("\n");
      for (const npm of npmArr) {
        const npmClear = this.__commonUtil.formatNpmLs(npm).trim();
        const isDepend = npmClear.indexOf("@") > -1;
        if (npmClear && isDepend) {
          const atArr = this.__commonUtil.findCharacterPosition(npmClear, "@");
          const atIndex = atArr.pop();
          npmList.push({
            name: npmClear.substring(0, atIndex),
            version: npmClear.substring(atIndex).replace("@", ""),
          });
        }
      }

      if (npmList) {
        cmdResult.resultMsg = JSON.stringify(npmList);
      }
    }

    return this.__commonUtil.formatResult(cmdResult);
  }

  /**
   * npm安装全局依赖
   * @param {string} depend
   */
  npmGlobalInstall(depend = "") {
    if (!depend) {
      return;
    }

    const cmdResult = this.__cmdUtil.execCmd(`npm install -g ${depend}`);
    return this.__commonUtil.formatResult(cmdResult);
  }

  /**
   * npm卸载全局依赖
   * @param {string} depend
   */
  npmGlobalUninstall(depend = "") {
    if (!depend) {
      return;
    }

    const cmdResult = this.__cmdUtil.execCmd(`npm uninstall -g ${depend}`);
    return this.__commonUtil.formatResult(cmdResult);
  }

  /**
   * npm清除缓存
   */
  npmCacheClean() {
    const cmdResult = this.__cmdUtil.execCmd("npm cache clean -f");
    return this.__commonUtil.formatResult(cmdResult);
  }
}

export { NpmUtil };
