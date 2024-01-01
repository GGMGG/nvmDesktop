// 工具类导入
import { CmdUtil } from "../utils/cmdUtil.js";
/**
 * 子进程安装工具类
 */
class ChildCmdUtil {
  /**
   * cmd工具类
   */
  __cmdUtil = new CmdUtil();

  /**
   * 子进程安装工具类
   */
  constructor() {}

  /**
   * 服务子进程监听
   */
  serverListening() {
    process.parentPort.once("message", (e) => {
      const cmdStr = e.data.cmdStr;
      if (!cmdStr) {
        process.parentPort.postMessage({ success: false });
        return;
      }

      const cmdResult = this.__cmdUtil.execCmd(cmdStr);
      if (!cmdResult) {
        process.parentPort.postMessage({ success: false });
        return;
      }

      process.parentPort.postMessage({ success: true, result: cmdResult });
    });
  }
}

const childCmdUtil = new ChildCmdUtil();
childCmdUtil.serverListening();
