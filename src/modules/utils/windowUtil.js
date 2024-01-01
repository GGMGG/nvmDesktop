// 初始化导入
import { BrowserWindow, globalShortcut, ipcMain, utilityProcess } from "electron";
// 工具类导入
import { CommonUtil } from "./commonUtil.js";
import { NvmUtil } from "./nvmUtil.js";
import { NpmUtil } from "./npmUtil.js";
import { NrmUtil } from "./nrmUtil.js";
import { ShortCutUtil } from "./shortCutUtil.js";

/**
 * 窗体工具类
 */
class WindowUtil {
  /**
   * 通用工具类
   */
  __commonUtil = new CommonUtil();

  /**
   * 快捷键工具类
   */
  __shortCutUtil = new ShortCutUtil();

  /**
   * nvm工具类
   */
  __nvmUtil = new NvmUtil();

  /**
   * npm工具类
   */
  __npmUtil = new NpmUtil();

  /**
   * nrm工具类
   */
  __nrmUtil = new NrmUtil();

  /**
   * 窗体配置
   */
  windowConfig = {
    // 窗体标题
    title: "nvmDesktop",
    // 默认窗体宽度
    defaultWidth: 1366,
    // 默认窗体高度
    defaultHeight: 760,
    // 白色
    whiteColor: "#FFFFFF",
    // setTimeOut默认时间
    timeOut: 500,
    // 主窗体页面路径
    mainHtmlUrl: "src/views/index.html",
    // 应用图标路径
    icon: "assets/icon/favicon.ico",
  };
  
  /**
   * 主窗体对象
   */
  mainWindows = null;

  /**
   * src路径
   */
  dirPath = "";

  /**
   * 子进程js脚本路径
   */
  childJsPath = "/modules/child/childCmdUtil.js";

  /**
   * 窗体工具类
   */
  constructor() {}

  /**
   * 创建主窗体
   */
  createMainView(dirName = "") {
    this.dirPath = dirName;
    // 创建主窗体
    // 设置参数
    this.mainWindows = new BrowserWindow({
      title: this.windowConfig.title,
      show: false,
      resizable: true,
      autoHideMenuBar: true,
      titleBarOverlay: {
        color: this.windowConfig.whiteColor,
        symbolColor: this.windowConfig.whiteColor,
      },
      width: this.windowConfig.defaultWidth,
      height: this.windowConfig.defaultHeight,
      minWidth: this.windowConfig.defaultWidth,
      minHeight: this.windowConfig.defaultHeight,
      backgroundColor: this.windowConfig.whiteColor,
      icon: this.windowConfig.icon,
      webPreferences: {
        preload: dirName + "/modules/preload/preload.js",
        webSecurity: false, //禁用同源策略
        nodeIntegration: false, // 是否启用Node integration.
        webviewTag: false, // 是否启用webview
      },
    });
    // 载入页面
    this.mainWindows.loadFile(this.windowConfig.mainHtmlUrl);
    // 监听窗体准备状态
    this.mainWindows.once("ready-to-show", () => {
      // 发送进程间通信（初始化）
      this.setIpcSend({});
      // 注册进程间通信
      this.setIpcOn();
      this.mainWindows.show();
    });
    // 监听窗体奔溃
    this.mainWindows.on("unresponsive", () => {
      this.__commonUtil.doCatchErr("错误", "页面奔溃了，即将重新创建窗体！", this.mainWindows);
    });
    // 监听窗体获得焦点
    this.mainWindows.on("focus", () => {
      // 注册普通快捷键
      this.__shortCutUtil.registryNormal(this.mainWindows);
    });
    // 监听窗体失去焦点
    this.mainWindows.on("blur", () => {
      globalShortcut.unregisterAll();
    });
  }

  /**
   * 进程间通信（主进程到渲染器）
   * @param {object} param
   */
  setIpcSend(param = {}) {
    if (param && param.method) {
      this.mainWindows.webContents.send(param.method, param.result);
    }
  }

  /**
   *注册进程间通信（渲染器到主进程）
   */
  setIpcOn() {
    // nvm
    this.setNvmIpcOn();
    // npm
    this.setNpmIpcOn();
    // nrm
    this.setNrmIpcOn();
    // common
    this.setCommonIpcOn();
  }

  /**
   * 注册进程间通信（渲染器到主进程）
   * nvm
   */
  setNvmIpcOn() {
    // 检查nvm版本
    ipcMain.on("check-nvm-version", (event, param) => {
      const checkNvmResult = this.__nvmUtil.checkNvm();
      this.setIpcSend({ method: "set-nvm-version", result: checkNvmResult });
    });

    // 获取本地node列表
    ipcMain.on("get-local-nodeList", (event, param) => {
      const localNodeList = this.__nvmUtil.getLocalNodeList();
      this.setIpcSend({ method: "set-local-nodeList", result: localNodeList });
    });

    // 获取网络可安装node列表
    ipcMain.on("get-net-nodeList", (event, param) => {
      const netNodeList = this.__nvmUtil.getNetNodeList();
      this.setIpcSend({ method: "set-net-nodeList", result: netNodeList });
    });

    // 安装指定版本
    ipcMain.on("install-node-version", (event, param) => {
      const version = (param.version || "").trim();
      if (!version) {
        return;
      }

      const callBack = (result = {}) => {
        if (result && result.success) {
          const localNodeList = this.__nvmUtil.getLocalNodeList();
          this.setIpcSend({ method: "install-node-finish", result: { success: true, version: version, resultMsg: result.resultMsg, localNodeList: localNodeList.result } });
        } else {
          const msg = result.errorMsg || result.resultMsg || "";
          let errMsg = `安装${version}失败！${msg}`;
          if (result.errorMsg && result.errorMsg.indexOf("index out of range [3] with length 3") > -1) {
            errMsg = `安装${version}失败，请升级nvm版本！`;
          }

          this.setIpcSend({ method: "install-node-finish", result: { success: false, errMsg: errMsg } });
        }
      };

      this.childFork(`nvm install ${version}`, callBack);
    });

    // 卸载指定版本
    ipcMain.on("uninstall-node-version", (event, param) => {
      const result = this.__nvmUtil.uninstallVersion(param.version);
      if (result && result.success) {
        const localNodeList = this.__nvmUtil.getLocalNodeList();
        this.setIpcSend({ method: "set-local-nodeList", result: localNodeList });
      } else {
        this.setIpcSend({ method: "show-msg", result: { msg: "卸载失败！" + result.result, type: 5 } });
      }
    });

    // 切换指定版本
    ipcMain.on("switch-version", (event, param) => {
      const result = this.__nvmUtil.switchVersion(param.version);
      if (result && result.success) {
        const localNodeList = this.__nvmUtil.getLocalNodeList();
        this.setIpcSend({ method: "set-local-nodeList", result: localNodeList });
      } else {
        this.setIpcSend({ method: "show-msg", result: { msg: "切换失败！" + result.result, type: 5 } });
      }
    });

    // 切换nvm开启/关闭状态
    ipcMain.on("switch-nvm-status", (event, param) => {
      const result = this.__nvmUtil.switchNvmStatus(param.isOn);
      if (result && result.success) {
        const localNodeList = this.__nvmUtil.getLocalNodeList();
        this.setIpcSend({ method: "set-local-nodeList", result: localNodeList });
      } else {
        this.setIpcSend({ method: "show-msg", result: { msg: "切换状态失败！" + result.result, type: 5 } });
      }
    });

    // 设置nvm proxy
    ipcMain.on("set-nvm-proxy", (event, param) => {
      const result = this.__nvmUtil.setNvmProxy(param.proxy);
      if (result && result.success) {
        this.setIpcSend({ method: "show-msg", result: { msg: "设置成功！", type: 6 } });
      } else {
        this.setIpcSend({ method: "show-msg", result: { msg: "设置失败！" + result.result, type: 5 } });
      }
    });

    // 设置nvm node mirror
    ipcMain.on("set-nvm-node-mirror", (event, param) => {
      this.__nvmUtil.setNvmNodeMirror(param.nodeMirror);
      this.setIpcSend({ method: "show-msg", result: { msg: "设置成功！", type: 6 } });
    });

    // 设置nvm npm mirror
    ipcMain.on("set-nvm-npm-mirror", (event, param) => {
      this.__nvmUtil.setNvmNpmMirror(param.npmMirror);
      this.setIpcSend({ method: "show-msg", result: { msg: "设置成功！", type: 6 } });
    });
  }

  /**
   * 注册进程间通信（渲染器到主进程）
   * npm
   */
  setNpmIpcOn() {
    // 获取npm全局依赖
    ipcMain.on("get-npm-globalList", (event, param) => {
      const npmGlobalList = this.__npmUtil.getNpmGlobalList();
      this.setIpcSend({ method: "set-npm-globalList", result: npmGlobalList });
    });

    // npm安装全局依赖
    ipcMain.on("npm-global-install", (event, param) => {
      const callBack = (result = {}) => {
        if (result && result.success) {
          const npmGlobalList = this.__npmUtil.getNpmGlobalList();
          this.setIpcSend({
            method: "install-npm-global-finish",
            result: { success: true, depend: param.depend, resultMsg: result.resultMsg, npmGlobalList: npmGlobalList.result },
          });
        } else {
          const msg = result.errorMsg || result.resultMsg || "";
          this.setIpcSend({ method: "install-npm-global-finish", result: { success: false, errMsg: `安装${param.depend}失败！${msg}` } });
        }
      };

      this.childFork(`npm install -g ${param.depend}`, callBack);
    });

    // npm卸载全局依赖
    ipcMain.on("npm-global-uninstall", (event, param) => {
      const depend = param.depend || "";
      if (!depend) {
        return;
      }

      const callBack = (result = {}) => {
        if (result && result.success) {
          const npmGlobalList = this.__npmUtil.getNpmGlobalList();
          this.setIpcSend({ method: "set-npm-globalList", result: npmGlobalList });
        } else {
          this.setIpcSend({ method: "show-msg", result: { msg: "卸载失败！" + result.result, type: 5 } });
        }
      };

      this.childFork(`npm uninstall -g ${depend}`, callBack);
    });

    // npm清除缓存
    ipcMain.on("npm-cache-clean", (event, param) => {
      this.__npmUtil.npmCacheClean();
      this.setIpcSend({ method: "show-msg", result: { msg: "清除成功！", type: -1 } });
    });
  }

  /**
   * 注册进程间通信（渲染器到主进程）
   * nrm
   */
  setNrmIpcOn() {
    // 检查nrm版本
    ipcMain.on("check-nrm-version", (event, param) => {
      const checkNrmResult = this.__nrmUtil.checkNrm();
      this.setIpcSend({ method: "set-nrm-version", result: checkNrmResult });
    });

    // 获取nrm配置
    ipcMain.on("get-nrmList", (event, param) => {
      const nrmList = this.__nrmUtil.getNrmList();
      this.setIpcSend({ method: "set-nrmList", result: nrmList });
    });

    // 切换nrm
    ipcMain.on("switch-nrm", (event, param) => {
      const result = this.__nrmUtil.switchNrm(param.nrmName);
      if (result && result.success) {
        const nrmList = this.__nrmUtil.getNrmList();
        this.setIpcSend({ method: "set-nrmList", result: nrmList });
      } else {
        this.setIpcSend({ method: "show-msg", result: { msg: "设置失败！" + result.result, type: 5 } });
      }
    });

    // 添加nrm
    ipcMain.on("add-nrm", (event, param) => {
      const result = this.__nrmUtil.addNrm(param.nrmName, param.nrmUrl);
      if (result && result.success) {
        const nrmList = this.__nrmUtil.getNrmList();
        this.setIpcSend({ method: "set-nrmList", result: nrmList });
      } else {
        this.setIpcSend({ method: "show-msg", result: { msg: "添加失败！" + result.result, type: 5 } });
      }
    });

    // 删除nrm
    ipcMain.on("del-nrm", (event, param) => {
      const result = this.__nrmUtil.delNrm(param.nrmName);
      if (result && result.success) {
        const nrmList = this.__nrmUtil.getNrmList();
        this.setIpcSend({ method: "set-nrmList", result: nrmList });
      } else {
        this.setIpcSend({ method: "show-msg", result: { msg: "删除失败！" + result.result, type: 5 } });
      }
    });
  }

  /**
   * 注册进程间通信（渲染器到主进程）
   * 通用
   */
  setCommonIpcOn() {}

  /**
   * 子进程执行cmd，避免主进程卡死
   * @param {string} cmdStr
   * @param {function} callBack
   */
  childFork(cmdStr = "", callBack = null) {
    if (!cmdStr) {
      return;
    }

    // 创建子进程服务
    const child = utilityProcess.fork(this.dirPath + this.childJsPath);
    // 向子进程发送参数
    child.once("spawn", () => {
      child.postMessage({ cmdStr: cmdStr });
    });

    // 接收子进程返回的结果
    child.once("message", (e) => {
      if (e.success && e.result) {
        const result = this.__commonUtil.formatResult(e.result);
        callBack && callBack(result);
      }

      child.kill();
    });
  }
}

export { WindowUtil };
