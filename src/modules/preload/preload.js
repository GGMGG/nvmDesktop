// 预加载脚本
// 初始化导入
const { contextBridge, ipcRenderer } = require("electron");

/**
 * 主进程通信渲染
 */
contextBridge.exposeInMainWorld("electronAPI", {
  // 主进程=>渲染器
  // 展示提示信息
  showMsg: (callback) => ipcRenderer.on("show-msg", callback),
  // 设置nvm版本
  setNvmVersion: (callback) => ipcRenderer.on("set-nvm-version", callback),
  // 设置本地安装的node列表
  setLocalNodeVersion: (callback) => ipcRenderer.on("set-local-nodeList", callback),
  // 设置网络可安装的node列表
  setNetNodeVersion: (callback) => ipcRenderer.on("set-net-nodeList", callback),
  // 安装NODE结束
  installNodeFinish: (callback) => ipcRenderer.on("install-node-finish", callback),
  // 设置npm全局依赖
  setNpmGlobalList: (callback) => ipcRenderer.on("set-npm-globalList", callback),
  // 安装npm全局依赖结束
  installNpmGlobalFinish: (callback) => ipcRenderer.on("install-npm-global-finish", callback),
  // 设置nrm版本
  setNrmVersion: (callback) => ipcRenderer.on("set-nrm-version", callback),
  // 设置nrm列表
  setNrmList: (callback) => ipcRenderer.on("set-nrmList", callback),

  // 渲染器=>主进程
  // 检查nvm版本
  checkNvmVersion: (param) => ipcRenderer.send("check-nvm-version", param),
  // 获取本地安装的node列表
  getLocalNodeVersion: (param) => ipcRenderer.send("get-local-nodeList", param),
  // 获取网络可安装的node列表
  getNetNodeVersion: (param) => ipcRenderer.send("get-net-nodeList", param),
  // 安装指定版本
  installVersion: (param) => ipcRenderer.send("install-node-version", param),
  // 卸载指定版本
  uninstallVersion: (param) => ipcRenderer.send("uninstall-node-version", param),
  // 切换指定版本
  switchVersion: (param) => ipcRenderer.send("switch-version", param),
  // 切换nvm启用/关闭状态
  switchNvmStatus: (param) => ipcRenderer.send("switch-nvm-status", param),
  // 设置nvm proxy
  setNvmProxy: (param) => ipcRenderer.send("set-nvm-proxy", param),
  // 设置nvm node mirror
  setNvmNodeMirror: (param) => ipcRenderer.send("set-nvm-node-mirror", param),
  // 设置nvm npm mirror
  setNvmNpmMirror: (param) => ipcRenderer.send("set-nvm-npm-mirror", param),
  // 获取npm全局依赖
  getNpmGlobalList: (param) => ipcRenderer.send("get-npm-globalList", param),
  // 安装npm全局依赖
  npmGlobalInstall: (param) => ipcRenderer.send("npm-global-install", param),
  // 卸载npm全局依赖
  npmGlobalUninstall: (param) => ipcRenderer.send("npm-global-uninstall", param),
  // npm清除缓存
  npmCacheClean: (param) => ipcRenderer.send("npm-cache-clean", param),
  // 检查nrm版本
  checkNrmVersion: (param) => ipcRenderer.send("check-nrm-version", param),
  // 获取nrm列表
  getNrmList: (param) => ipcRenderer.send("get-nrmList", param),
  // 切换nrm
  switchNrm: (param) => ipcRenderer.send("switch-nrm", param),
  // 添加nrm
  addNrm: (param) => ipcRenderer.send("add-nrm", param),
  // 删除nrm
  delNrm: (param) => ipcRenderer.send("del-nrm", param),
});
