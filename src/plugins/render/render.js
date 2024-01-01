// 应用初始化
// 初始化全局变量
let $,
  layer,
  form,
  element,
  table = null;

let localNodeList = []; // 本地node list
let netNodeList = []; // 远程node list
let npmGlobalList = []; // npm全局依赖list
let nrmList = []; // nrm list
let localInit = false; // 本地node list table是否初始化
let netInit = false; // 远程node list table是否初始化
let npmGlobalInit = false; // npm全局依赖list table是否初始化
let nrmInit = false; // nrm list table是否初始化
let isNodeInstall = false; // 是否安装node中
let isNpmInstall = false; // 是否安装npm中
let showLoading = null; // loading对象
let isNvmOn = true; // nvm是否启用

// 主进程调用渲染进程方法
/**
 * 展示提示信息
 */
const showMsg = () => {
  window.electronAPI.showMsg((event, value) => {
    if (value && value.msg && value.type) {
      if (value.type === -1) {
        layer.msg(value.msg);
      } else {
        layer.msg(value.msg, { icon: value.type }, function () {});
      }
    } else {
      layer.msg("操作失败！", { icon: 5 }, function () {});
    }
  });
};

/**
 * 设置nvm版本
 */
const setNvmVersion = () => {
  window.electronAPI.setNvmVersion((event, value) => {
    if (value && value.success) {
      $("#nvm-version").html(`v${value.result}`);
      $("#help-nvm-version").html(`${value.result}`);
    } else {
      $("#nvm-version").html(`nvm版本检测错误`);
      $("#help-nvm-version").html(`nvm版本检测错误`);
      layer.msg("请下载并安装nvm（https://github.com/coreybutler/nvm-windows/releases）", { icon: 0 }, function () {});
    }
  });
};

/**
 * 设置本地安装的node版本
 */
const setLocalNodeVersion = () => {
  window.electronAPI.setLocalNodeVersion((event, value) => {
    if (value && value.success) {
      localNodeList = JSON.parse(value.result);
      layer.msg("获取成功！", { time: "500" });
    } else {
      layer.msg("暂无数据！", { time: "1000", icon: 5 }, function () {});
    }

    initNvmOnOff();
    initLocalNodeTable();
  });
};

/**
 * 设置网络可按照的node版本
 */
const setNetNodeVersion = () => {
  window.electronAPI.setNetNodeVersion((event, value) => {
    if (value && value.success) {
      netNodeList = JSON.parse(value.result);
      layer.msg("获取成功！", { time: "500" });
    } else {
      layer.msg("暂无数据！请检查网络环境！", { time: "1000", icon: 5 }, function () {});
    }

    initNetNodeTable();
  });
};

/**
 * 安装NODE结束
 */
const installNodeFinish = () => {
  window.electronAPI.installNodeFinish((event, value) => {
    isNodeInstall = false;
    layer.close(showLoading);
    if (value && value.success) {
      layer.msg(`安装${value.version}成功！`);
      localNodeList = JSON.parse(value.localNodeList);
      setTimeout(() => {
        initLocalNodeTable();
      }, 500);
    } else {
      layer.msg(value.errMsg || "安装失败！", { icon: 5 }, function () {});
    }
  });
};

/**
 * 设置npm全局依赖
 */
const setNpmGlobalList = () => {
  window.electronAPI.setNpmGlobalList((event, value) => {
    if (value && value.success) {
      npmGlobalList = JSON.parse(value.result);
      layer.msg("获取成功！", { time: "500" });
    } else {
      layer.msg("暂无数据！", { time: "1000", icon: 5 }, function () {});
    }

    checkNrmVersion();
    initNpmGlobalTable();
  });
};

/**
 * 安装NPM结束
 */
const installNpmGlobalFinish = () => {
  window.electronAPI.installNpmGlobalFinish((event, value) => {
    isNpmInstall = false;
    layer.close(showLoading);
    if (value && value.success) {
      layer.msg(`安装${value.depend}成功！`);
      npmGlobalList = JSON.parse(value.npmGlobalList);
      setTimeout(() => {
        initNpmGlobalTable();
        checkNrmVersion();
      }, 500);
    } else {
      layer.msg(value.errMsg || "安装失败！", { icon: 5 }, function () {});
    }
  });
};

/**
 * 设置nrm版本
 */
const setNrmVersion = () => {
  window.electronAPI.setNrmVersion((event, value) => {
    if (value && value.success) {
      $("#help-nrm-version").html(`${value.result}`);
      $("#help-nrm").show();
      initNrmOnOff(true);
    } else {
      $("#help-nrm").hide();
      initNrmOnOff(false);
    }
  });
};

/**
 * 设置nrm列表
 */
const setNrmList = () => {
  window.electronAPI.setNrmList((event, value) => {
    if (value && value.success) {
      nrmList = JSON.parse(value.result);
      layer.msg("获取成功！", { time: "500" });
    } else {
      layer.msg("暂无数据！", { time: "1000", icon: 5 }, function () {});
    }

    initNrmTable();
  });
};

// 主进程调用渲染进程方法

// 渲染进程调用主进程方法
/**
 * 检查nvm版本
 */
const checkNvmVersion = () => {
  window.electronAPI.checkNvmVersion();
};

/**
 * 获取本地安装的node列表
 */
const getLocalNodeVersion = () => {
  window.electronAPI.getLocalNodeVersion();
};

/**
 * 获取远程可安装的node列表
 */
const getNetNodeVersion = () => {
  window.electronAPI.getNetNodeVersion();
};

/**
 * 安装指定版本
 * @param {string} version
 */
const installVersion = (version = "") => {
  if (!version) {
    layer.msg("版本错误！", { icon: 5 }, function () {});
    return;
  }

  if (!isNvmOn) {
    layer.msg("请先开启nvm", { icon: 5 }, function () {});
    return;
  }

  if (!isNodeInstall) {
    const nodeVersionArr = localNodeList.map((node) => node.version);
    if (nodeVersionArr && nodeVersionArr.length > 0) {
      if (nodeVersionArr.includes(version)) {
        layer.msg(`已安装${version}，请勿重复安装！`, { icon: 5 }, function () {});
        return;
      }
    }

    isNodeInstall = true;
    showLoading = layer.msg(`安装中，请稍后...`, {
      icon: 16,
      shade: [0.3, "#000"],
      time: 0,
    });
    window.electronAPI.installVersion({ version: version });
  } else {
    layer.msg("安装任务进行中，请稍后...", { time: "3000" });
  }
};

/**
 * 卸载指定版本
 * @param {string} version
 */
const uninstallVersion = (version = "") => {
  if (!version) {
    layer.msg("版本错误！", { icon: 5 }, function () {});
    return;
  }

  layer.confirm(
    `确定卸载版本${version}？`,
    { title: "警告", icon: 3 },
    function () {
      layer.msg("卸载中，请稍后...", { time: "1500" });
      window.electronAPI.uninstallVersion({ version: version });
    },
    function () {}
  );
};

/**
 * 切换指定版本
 * @param {string} version
 */
const switchVersion = (version = "") => {
  if (!version) {
    layer.msg("版本错误！", { icon: 5 }, function () {});
    return;
  }

  layer.msg("切换中，请稍后...", { time: "500" });
  window.electronAPI.switchVersion({ version: version });
};

/**
 *切换nvm on/off
 */
const switchNvmStatus = () => {
  isNvmOn = !isNvmOn;
  window.electronAPI.switchNvmStatus({ isOn: isNvmOn });
};

/**
 * 设置nvm proxy
 * @param {string} proxy
 */
const setNvmProxy = (proxy = "") => {
  window.electronAPI.setNvmProxy({ proxy: proxy });
};

/**
 * 设置nvm node mirror
 * @param {string} nodeMirror
 */
const setNvmNodeMirror = (nodeMirror = "") => {
  window.electronAPI.setNvmNodeMirror({ nodeMirror: nodeMirror });
};

/**
 * 设置nvm npm mirror
 * @param {string} npmMirror
 */
const setNvmNpmMirror = (npmMirror = "") => {
  window.electronAPI.setNvmNpmMirror({ npmMirror: npmMirror });
};

/**
 * 获取npm全局依赖
 */
const getNpmGlobalList = () => {
  window.electronAPI.getNpmGlobalList();
};

/**
 * npm安装全局依赖
 * @param {string} depend
 */
const npmGlobalInstall = (depend = "") => {
  if (!depend) {
    layer.msg("依赖错误！", { icon: 5 }, function () {});
    return;
  }

  if (!isNpmInstall) {
    isNpmInstall = true;
    showLoading = layer.msg("安装中，请稍后...", {
      icon: 16,
      shade: [0.3, "#000"],
      time: 0,
    });
    window.electronAPI.npmGlobalInstall({ depend: depend });
  } else {
    layer.msg("安装任务进行中，请稍后...", { time: "3000" });
  }
};

/**
 * npm卸载全局依赖
 * @param {string} depend
 */
const npmGlobalUninstall = (depend = "") => {
  if (!depend) {
    layer.msg("依赖错误！", { icon: 5 }, function () {});
    return;
  }

  layer.confirm(
    `确定卸载${depend}？`,
    { title: "警告", icon: 3 },
    function () {
      showLoading = layer.msg("卸载中，请稍后...", {
        icon: 16,
        shade: [0.3, "#000"],
        time: 0,
      });
      window.electronAPI.npmGlobalUninstall({ depend: depend });
    },
    function () {}
  );
};

/**
 * npm清除缓存
 */
const npmCacheClean = () => {
  window.electronAPI.npmCacheClean();
};

/**
 * 检查nrm版本
 */
const checkNrmVersion = () => {
  let hasNrm = false;
  for (const npm of npmGlobalList) {
    if (npm.name === "nrm") {
      hasNrm = true;
    }
  }

  if (hasNrm) {
    window.electronAPI.checkNrmVersion();
    return;
  }

  initNrmOnOff(false);
};

/**
 * 获取nrm列表
 */
const getNrmList = () => {
  window.electronAPI.getNrmList();
};

/**
 * 切换nrm
 * @param {string} nrmName
 */
const switchNrm = (nrmName = "") => {
  if (!nrmName) {
    layer.msg("名称错误！", { icon: 5 }, function () {});
    return;
  }

  window.electronAPI.switchNrm({ nrmName: nrmName });
};

/**
 * 添加nrm
 * @param {string} nrmName
 * @param {string} nrmUrl
 */
const addNrm = (nrmName = "", nrmUrl = "") => {
  if (!nrmName || !nrmUrl) {
    layer.msg("名称或地址错误！", { icon: 5 }, function () {});
    return;
  }

  window.electronAPI.addNrm({ nrmName: nrmName, nrmUrl: nrmUrl });
};

/**
 * 删除nrm
 * @param {string} nrmName
 */
const delNrm = (nrmName = "") => {
  if (!nrmName) {
    layer.msg("名称错误！", { icon: 5 }, function () {});
    return;
  }

  window.electronAPI.delNrm({ nrmName: nrmName });
};

// 渲染进程调用主进程方法

// 应用方法
/**
 * nvm是否启用初始化
 */
const initNvmOnOff = () => {
  const nowUseNode = localNodeList.filter((item) => item.isCurren);
  if (nowUseNode && nowUseNode.length > 0) {
    isNvmOn = true;
  } else {
    isNvmOn = false;
  }

  $("#switch-nvm-btn").attr("title", isNvmOn ? "关闭" : "开启");
  initNpmNrmTab();
};

/**
 * 初始化npm nrm tab
 */
const initNpmNrmTab = () => {
  if (isNvmOn) {
    $("#npmList").show();
    getNpmGlobalList();
  } else {
    $("#npmList").hide();
    $("#nrmList").hide();
    $("#help-nrm").hide();
  }
};

/**
 * nrm是否安装初始化
 * @param {boolean} hasNrm
 */
const initNrmOnOff = (hasNrm = false) => {
  if (hasNrm) {
    $("#nrmList").show();
    getNrmList();
  } else {
    $("#nrmList").hide();
  }
};

/**
 * 动态抽屉初始化
 * @param {string} drawerId
 */
const initDraw = (drawerId = "") => {
  layer.closeAll("page");
  layer.open({
    type: 1,
    title: false,
    closeBtn: 0,
    offset: "r",
    anim: "slideLeft",
    area: ["35%", "100%"],
    shade: 0.3,
    shadeClose: true,
    id: drawerId,
    content: $("#" + drawerId),
    // 打开弹层成功后的回调函数
    success: function (layero, index, that) {},
    // 弹层被关闭且销毁后的回调函数
    end: function () {},
  });
};

/**
 * 初始化本地node列表数据
 */
const initLocalNodeTable = () => {
  $("#node-loading-tips-local").hide();
  if (localInit) {
    table.reloadData("node-local-table", { data: localNodeList });
    return;
  }

  // 设置表格数据
  table.render({
    elem: "#node-local-table",
    cols: [
      [
        { field: "version", title: "node版本", width: "30%", sort: true },
        {
          field: "isCurren",
          title: "是否当前",
          width: "30%",
          templet: function (data) {
            if (data.isCurren) {
              return `<span><img src="../assets/svg/this.svg" /></span>`;
            } else {
              return `<span><img src="../assets/svg/unthis.svg" /></span>`;
            }
          },
        },
        {
          field: "action",
          title: "操作",
          width: "40%",
          templet: function (data) {
            let actionHtml = "";
            if (!data.isCurren) {
              actionHtml += `<span title="使用" class="node-table-action" onclick="switchVersion('${data.version}')"><img src="../assets/svg/active.svg" /></span>`;
              actionHtml += `<span title="卸载" class="node-table-action" onclick="uninstallVersion('${data.version}')"><img src="../assets/svg/delete.svg" /></span>`;
            }

            return actionHtml;
          },
        },
      ],
    ],
    data: localNodeList,
    page: {
      layout: ["count", "prev", "page", "next", "limit"],
    },
    limits: [10, 15, 20, 50, 100],
    limit: 10,
    skin: "nob",
    size: "lg",
    className: "local-tab-table",
  });

  localInit = true;
};

/**
 * 初始化网络node列表数据
 */
const initNetNodeTable = () => {
  $("#node-loading-tips-net").hide();
  $("#node-net-search").hide();
  if (netInit) {
    table.reloadData("node-net-table", { data: netNodeList });
    $("#node-net-search").show();
    return;
  }

  // 设置表格数据
  table.render({
    elem: "#node-net-table",
    cols: [
      [
        { field: "version", title: "node版本", width: "30%", sort: true },
        {
          field: "type",
          title: "类型",
          width: "30%",
          sort: true,
          templet: function (data) {
            if (data.type) {
              const typeCode = ["CURRENT", "LTS", "OLDSTABLE", "OLDUNSTABLE"];
              const typeMsg = ["通用版本", "长期支持版本", "旧的稳定版本", "旧的不稳定版本"];
              const typeColor = ["var(--color)", "var(--second-color)", "var(--third-color)", "var(--fourth-color)"];
              const typeColorStr = typeColor[typeCode.indexOf(data.type)];
              const typeMsgStr = typeMsg[typeCode.indexOf(data.type)];
              return `<span style="color: ${typeColorStr}">${typeMsgStr}</span>`;
            } else {
              return `<span style="color: var(--third-color)">未知类型</span>`;
            }
          },
        },
        {
          field: "action",
          title: "操作",
          width: "40%",
          templet: function (data) {
            let actionHtml = "";
            actionHtml += `<span title="安装" class="node-table-action" onclick="installVersion('${data.version}')"><img src="../assets/svg/download.svg" /></i></span>`;
            return actionHtml;
          },
        },
      ],
    ],
    data: netNodeList,
    page: {
      layout: ["count", "prev", "page", "next", "limit"],
    },
    limits: [10, 15, 20, 50, 100],
    limit: 10,
    skin: "nob",
    size: "lg",
    className: "local-tab-table",
  });

  netInit = true;
  $("#node-net-search").show();
};

/**
 * 网络node列表数据搜索
 * @param {string} version
 * @param {string} type
 */
const netNodeTableSearch = (version = "", type = "") => {
  if (!version && !type) {
    initNetNodeTable();
    return;
  }

  let filteredArray = netNodeList;
  // 搜索版本
  if (version) {
    filteredArray = filteredArray.filter((item) => item.version.indexOf(version) > -1);
  }

  // 搜索类型
  if (type) {
    filteredArray = filteredArray.filter((item) => item.type === type);
  }

  table.reloadData("node-net-table", {
    data: filteredArray,
    page: {
      curr: 1,
      layout: ["count", "prev", "page", "next", "limit"],
    },
  });
};

/**
 * 初始化npm全局依赖列表数据
 */
const initNpmGlobalTable = () => {
  if (npmGlobalInit) {
    table.reloadData("npm-global-table", { data: npmGlobalList });
    return;
  }

  // 设置表格数据
  table.render({
    elem: "#npm-global-table",
    cols: [
      [
        { field: "name", title: "依赖名称", width: "30%", sort: true },
        { field: "version", title: "依赖版本", width: "30%", sort: true },
        {
          field: "action",
          title: "操作",
          width: "40%",
          templet: function (data) {
            let actionHtml = "";
            if (data.name !== "npm") {
              actionHtml += `<span title="卸载" class="node-table-action" onclick="npmGlobalUninstall('${data.name}')"><img src="../assets/svg/delete.svg" /></span>`;
            }

            return actionHtml;
          },
        },
      ],
    ],
    data: npmGlobalList,
    page: {
      layout: ["count", "prev", "page", "next", "limit"],
    },
    limits: [10, 15, 20, 50, 100],
    limit: 10,
    skin: "nob",
    size: "lg",
    className: "local-tab-table",
  });

  npmGlobalInit = true;
};

/**
 * 初始化nrm列表数据
 */
const initNrmTable = () => {
  if (nrmInit) {
    table.reloadData("nrm-list-table", { data: nrmList });
    return;
  }

  // 设置表格数据
  table.render({
    elem: "#nrm-list-table",
    cols: [
      [
        { field: "name", title: "名称", width: "20%", sort: true },
        { field: "url", title: "地址", width: "40%", sort: true },
        {
          field: "isCurren",
          title: "是否当前",
          width: "20%",
          templet: function (data) {
            if (data.isCurren) {
              return `<span><img src="../assets/svg/this.svg" /></span>`;
            } else {
              return `<span><img src="../assets/svg/unthis.svg" /></span>`;
            }
          },
        },
        {
          field: "action",
          title: "操作",
          width: "20%",
          templet: function (data) {
            let actionHtml = "";
            if (!data.isCurren) {
              actionHtml += `<span title="使用" class="node-table-action" onclick="switchNrm('${data.name}')"><img src="../assets/svg/active.svg" /></span>`;
              actionHtml += `<span title="删除" class="node-table-action" onclick="delNrm('${data.name}')"><img src="../assets/svg/delete.svg" /></span>`;
            }

            return actionHtml;
          },
        },
      ],
    ],
    data: nrmList,
    page: {
      layout: ["count", "prev", "page", "next", "limit"],
    },
    limits: [10, 15, 20, 50, 100],
    limit: 10,
    skin: "nob",
    size: "lg",
    className: "local-tab-table",
  });

  nrmInit = true;
};

// 应用方法

/**
 * 页面初始化方法
 */
const init = () => {
  setTimeout(() => {
    // 延迟检查nvm版本
    checkNvmVersion();
    // 延迟获取本地安装的node列表
    getLocalNodeVersion();
  }, 1000);
};

// 注册主进程调用渲染进程方法
showMsg();
setNvmVersion();
setLocalNodeVersion();
setNetNodeVersion();
installNodeFinish();
setNpmGlobalList();
installNpmGlobalFinish();
setNrmVersion();
setNrmList();
