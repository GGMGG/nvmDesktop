// 初始化导入
import { globalShortcut } from "electron";

/**
 * 快捷键注册工具类
 */
class ShortCutUtil {
  /**
   * 快捷键注册工具类
   */
  constructor() {}

  /**
   * 快捷键注册
   * @param {object} windowsName
   */
  registryNormal(windowsName = {}) {
    // 销毁所有快捷键
    globalShortcut.unregisterAll();

    // 注册开发者工具
    globalShortcut.register("CommandOrControl+F12", () => {
      windowsName.webContents.openDevTools();
    });

    // 刷新当前页面
    globalShortcut.register("F5", () => {
      windowsName.webContents.reload();
    });

    // 强制刷新页面
    globalShortcut.register("CommandOrControl+F5", () => {
      windowsName.webContents.reload();
    });
  }
}

export { ShortCutUtil };
