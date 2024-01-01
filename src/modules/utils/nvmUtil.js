// 工具类导入
import { CommonUtil } from "./commonUtil.js";
import { CmdUtil } from "./cmdUtil.js";

/**
 * nvm工具类
 */
class NvmUtil {
  /**
   * 通用工具类
   */
  __commonUtil = new CommonUtil();

  /**
   * cmd工具类
   */
  __cmdUtil = new CmdUtil();

  /**
   * nvm工具类
   */
  constructor() {}

  /**
   * 检查是否安装了nvm
   */
  checkNvm() {
    const cmdResult = this.__cmdUtil.execCmd("nvm -v");
    return this.__commonUtil.formatResult(cmdResult);
  }

  /**
   * 获取本地node列表
   */
  getLocalNodeList() {
    let cmdResult = this.__cmdUtil.execCmd("nvm list");
    if (cmdResult.success && cmdResult.resultMsg) {
      let nodeList = [];
      const clearWrap = this.__commonUtil.trimChar(cmdResult.resultMsg, "\n").trim();
      const nodeArr = clearWrap.split("\n");
      for (const node of nodeArr) {
        const isCurren = node.indexOf("*") > -1;
        nodeList.push({
          version: isCurren ? node.substring(node.indexOf("*") + 1, node.indexOf("(")).trim() : node.trim(),
          isCurren: isCurren,
        });
      }

      if (nodeList) {
        cmdResult.resultMsg = JSON.stringify(nodeList);
      }
    }

    return this.__commonUtil.formatResult(cmdResult);
  }

  /**
   * 获取可安装的node列表
   */
  getNetNodeList() {
    const cmdResult = this.__cmdUtil.execCmd("nvm list available");
    if (cmdResult.success && cmdResult.resultMsg) {
      let nodeList = [];
      let currentNodeList = [];
      let ltsNodeList = [];
      let oldStableList = [];
      let oldUnStableList = [];
      const clearWrap = this.__commonUtil.trimChar(cmdResult.resultMsg, "\n").trim();
      let nodeArr = clearWrap.split("\n");
      nodeArr = nodeArr.filter(function (element) {
        return element !== undefined && element !== null && element !== "" && element.indexOf(".") != -1 && element.indexOf("|") != -1;
      });

      for (const node of nodeArr) {
        const clearVerticalLine = this.__commonUtil.trimChar(node, "|").trim();
        const lineArr = clearVerticalLine.split("|");
        lineArr.forEach(function (element, index) {
          switch (index) {
            case 0:
              currentNodeList.push({
                version: element.trim(),
                type: "CURRENT",
              });
              break;

            case 1:
              ltsNodeList.push({
                version: element.trim(),
                type: "LTS",
              });
              break;

            case 2:
              oldStableList.push({
                version: element.trim(),
                type: "OLDSTABLE",
              });
              break;

            case 3:
              oldUnStableList.push({
                version: element.trim(),
                type: "OLDUNSTABLE",
              });
              break;

            default:
              break;
          }
        });
      }

      nodeList = [...ltsNodeList, ...currentNodeList, ...oldStableList, ...oldUnStableList];
      if (nodeList) {
        cmdResult.resultMsg = JSON.stringify(nodeList);
      }
    }

    return this.__commonUtil.formatResult(cmdResult);
  }

  /**
   * 安装指定版本
   * @param {string} version
   */
  installVersion(version = "") {
    if (!version) {
      return;
    }

    const cmdResult = this.__cmdUtil.execCmd(`nvm install ${version.trim()}`);
    return this.__commonUtil.formatResult(cmdResult);
  }

  /**
   * 卸载指定版本
   * @param {string} version
   */
  uninstallVersion(version = "") {
    if (!version) {
      return;
    }

    const cmdResult = this.__cmdUtil.execCmd(`nvm uninstall ${version.trim()}`);
    return this.__commonUtil.formatResult(cmdResult);
  }

  /**
   * 切换指定版本
   * @param {string} version
   */
  switchVersion(version = "") {
    if (!version) {
      return;
    }

    const cmdResult = this.__cmdUtil.execCmd(`nvm use ${version.trim()}`);
    return this.__commonUtil.formatResult(cmdResult);
  }

  /**
   * 切换nvm开启/关闭状态
   * @param {boolean} isOn
   */
  switchNvmStatus(isOn = true) {
    const cmdResult = this.__cmdUtil.execCmd(isOn ? "nvm on" : "nvm off");
    return this.__commonUtil.formatResult(cmdResult);
  }

  /**
   * 设置nvm代理
   * @param {string} proxy
   */
  setNvmProxy(proxy = "") {
    const cmdResult = this.__cmdUtil.execCmd(`nvm proxy ${proxy.trim()}`);
    return this.__commonUtil.formatResult(cmdResult);
  }

  /**
   * 设置node mirror，默认是https://nodejs.org/dist/
   * @param {string} isOn
   */
  setNvmNodeMirror(nodeMirror = "") {
    if (!nodeMirror) {
      return;
    }

    const cmdResult = this.__cmdUtil.execCmd(`nvm node_mirror ${nodeMirror.trim()}`);
    return this.__commonUtil.formatResult(cmdResult);
  }

  /**
   * 设置node mirror，默认是https://github.com/npm/npm/archive/
   * @param {string} npmMirror
   */
  setNvmNpmMirror(npmMirror = "") {
    if (!npmMirror) {
      return;
    }

    const cmdResult = this.__cmdUtil.execCmd(`nvm npm_mirror ${npmMirror.trim()}`);
    return this.__commonUtil.formatResult(cmdResult);
  }
}

export { NvmUtil };
