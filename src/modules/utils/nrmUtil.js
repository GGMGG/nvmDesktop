// 工具类导入
import { CommonUtil } from "./commonUtil.js";
import { CmdUtil } from "./cmdUtil.js";

/**
 * nrm工具类
 */
class NrmUtil {
  /**
   * 通用工具类
   */
  __commonUtil = new CommonUtil();

  /**
   * cmd工具类
   */
  __cmdUtil = new CmdUtil();

  /**
   * nrm工具类
   */
  constructor() {}

  /**
   * 检查是否安装了nvm
   */
  checkNrm() {
    const cmdResult = this.__cmdUtil.execCmd("nrm -V");
    return this.__commonUtil.formatResult(cmdResult);
  }

  /**
   * 获取nrm配置
   */
  getNrmList() {
    const cmdResult = this.__cmdUtil.execCmd("nrm ls");
    if (cmdResult.success && cmdResult.resultMsg) {
      let nrmList = [];
      const nrmArr = cmdResult.resultMsg.split("\n");
      for (const nrm of nrmArr) {
        const isCurren = nrm.indexOf("*") > -1;
        const urlIndex = nrm.indexOf("http");
        const name = nrm.substring(0, urlIndex).replaceAll("-", "").replace("*", "").trim();
        const url = nrm.substring(urlIndex).trim();
        if (name && url) {
          nrmList.push({
            name: name,
            url: url,
            isCurren: isCurren,
          });
        }
      }

      if (nrmList) {
        cmdResult.resultMsg = JSON.stringify(nrmList);
      }
    }

    return this.__commonUtil.formatResult(cmdResult);
  }

  /**
   * 获取nrm当前源
   */
  getNrmCurrent() {
    const cmdResult = this.__cmdUtil.execCmd("nrm current");
    return this.__commonUtil.formatResult(cmdResult);
  }

  /**
   * 切换nrm
   * @param {string} nrmName
   */
  switchNrm(nrmName = "") {
    if (!nrmName) {
      return;
    }

    const cmdResult = this.__cmdUtil.execCmd(`nrm use ${nrmName}`);
    return this.__commonUtil.formatResult(cmdResult);
  }

  /**
   * 添加nrm地址
   * @param {string} nrmName
   * @param {string} nrmUrl
   */
  addNrm(nrmName = "", nrmUrl = "") {
    if (!nrmName || !nrmUrl) {
      return;
    }

    const cmdResult = this.__cmdUtil.execCmd(`nrm add ${nrmName} ${nrmUrl}`);
    return this.__commonUtil.formatResult(cmdResult);
  }

  /**
   * 删除nrm地址
   * @param {string} nrmName
   */
  delNrm(nrmName = "") {
    if (!nrmName) {
      return;
    }

    const cmdResult = this.__cmdUtil.execCmd(`nrm del ${nrmName}`);
    return this.__commonUtil.formatResult(cmdResult);
  }
}

export { NrmUtil };
