// 初始化导入
import { Notification, dialog } from "electron";

/**
 * 提示工具类
 */
class NoticeUtil {
  /**
   * 提示工具类
   */
  constructor() {}

  /**
   * 通知提醒
   * @param {string} title
   * @param {string} body
   */
  showNotice(title = "", body = "") {
    if (title && body) {
      // 计算机不支持系统提示，使用election的错误提示框
      if (!Notification.isSupported) {
        dialog.showErrorBox(title, body);
        return;
      }

      // 计算机支持系统提示
      new Notification({ title: title, body: body }).show();
    } else {
      console.log("showNotice-提示信息的title或者body为空");
    }
  }
}

export { NoticeUtil };
