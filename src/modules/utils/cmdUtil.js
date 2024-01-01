// cmd导入
import { execSync } from "child_process";

/**
 * cmd工具类
 */
class CmdUtil {
  /**
   * cmd执行结果（统一返回）
   */
  cmdResult = {
    success: false,
    resultMsg: "",
    errorMsg: "",
  };

  /**
   * cmd执行结果（解析用）
   */
  execResult = {
    data: "",
    err: "",
    stderr: "",
  };

  /**
   * cmd工具类
   */
  constructor() {}

  /**
   * 执行cmd
   * @param {string} cmdStr
   */
  execCmd(cmdStr = "") {
    if (!cmdStr) {
      return (this.cmdResult = {
        success: false,
        resultMsg: "命令为空",
        errorMsg: "命令为空",
      });
    }

    const syncCmd = this.runCommandSync(cmdStr);
    return this.analysisResult({
      errStr: syncCmd.err,
      dataStr: syncCmd.data,
      stderrStr: syncCmd.stderr,
    });
  }

  /**
   * cmd执行结果解析
   * @param {object} cmdExecResult
   */
  analysisResult({ errStr = "", dataStr = "", stderrStr = "" }) {
    if (errStr || stderrStr) {
      return (this.cmdResult = {
        success: false,
        resultMsg: "命令执行错误",
        errorMsg: errStr || stderrStr,
      });
    }

    if (dataStr) {
      return (this.cmdResult = {
        success: true,
        resultMsg: dataStr,
        errorMsg: "",
      });
    }

    return (this.cmdResult = {
      success: false,
      resultMsg: "解析错误",
      errorMsg: "解析错误",
    });
  }

  /**
   * 异步执行命令
   * @param {string} command
   */
  runCommandSync(command = "") {
    try {
      return {
        data: execSync(command).toString(),
        err: null,
        stderr: null,
      };
    } catch (error) {
      return {
        data: null,
        err: error.stderr.toString(),
        stderr: error.stderr.toString(),
      };
    }
  }
}

export { CmdUtil };
