// 主程序main
// 初始化导入
import { app, globalShortcut } from "electron";
// 路径导入
import path from "path";
import { fileURLToPath } from "url";
// 工具类导入
import { WindowUtil } from "./modules/utils/windowUtil.js";

/**
 * 程序执行类
 */
class Application {
  /**
   * 窗体工具类
   */
  __windowUtil = new WindowUtil();

  /**
   * 文件路径
   */
  __dirnameNew = "";

  /**
   * 程序执行类
   */
  constructor() {
    // 设置路径
    const __fileNameNew = fileURLToPath(import.meta.url);
    this.__dirnameNew = path.dirname(__fileNameNew);
  }

  /**
   * 程序执行
   */
  appRun() {
    // ready时执行脚本
    app.whenReady().then(() => {
      // 创建主窗体
      this.__windowUtil.createMainView(this.__dirnameNew);
    });

    // 窗口关闭监听
    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit();
      }
    });

    // 窗口退出监听，注销快捷键
    app.on("will-quit", () => {
      globalShortcut.unregisterAll();
    });
  }
}

/**
 * 应用初始化
 */
const application = new Application();
application.appRun();
