// 组件初始化引入
layui.use(["jquery", "layer", "form", "table"], function () {
  $ = layui.jquery;
  layer = layui.layer;
  form = layui.form;
  element = layui.element;
  table = layui.table;

  // 初始化
  init();

  // 刷新按钮监听
  form.on("submit(refresh-btn)", function () {
    checkNvmVersion();
    return false;
  });

  // node安装按钮监听
  form.on("submit(node-install-btn)", function () {
    layer.prompt({ title: "请输入node完整版本号进行安装" }, function (value, index, elem) {
      if (!value) return elem.focus();
      installVersion(value.trim());
      layer.close(index);
    });

    return false;
  });

  // npm安装按钮监听
  form.on("submit(npm-install-btn)", function () {
    layer.prompt({ title: "请输入依赖名称/版本号进行安装" }, function (value, index, elem) {
      if (!value) return elem.focus();
      npmGlobalInstall(value.trim());
      layer.close(index);
    });

    return false;
  });

  // nrm添加按钮监听
  form.on("submit(nrm-add-btn)", function () {
    layer.prompt({ title: "请输入nrm名称进行添加" }, function (value, index, elem) {
      if (!value) return elem.focus();
      const name = value.trim();
      if (name) {
        layer.prompt({ title: "请输入nrm地址进行添加" }, function (value, index, elem) {
          if (!value) return elem.focus();
          const url = value.trim();
          addNrm(name, url);
          layer.close(index);
        });
      } else {
        return elem.focus();
      }

      layer.close(index);
    });

    return false;
  });

  // npm清除缓存按钮监听
  form.on("submit(npm-cache-clean-btn)", function () {
    npmCacheClean();
    return false;
  });

  // 切换按钮监听
  form.on("submit(switchNvm-btn)", function () {
    switchNvmStatus();
    element.tabChange("nvm-tab", "1");
    return false;
  });

  // 帮助按钮监听
  form.on("submit(help-btn)", function () {
    initDraw("help-form-drawer");
    return false;
  });

  // tab页签切换事件
  element.on("tab(nvm-tab)", function (data) {
    const index = data.index;
    if (index === 0 && !localInit) {
      getLocalNodeVersion();
    }

    if (index === 1 && !netInit) {
      getNetNodeVersion();
    }

    if (index === 0 || index === 1) {
      $("#node-install-btn").show();
    } else {
      $("#node-install-btn").hide();
    }

    if (index === 2) {
      $("#npm-install-btn").show();
      $("#npm-cache-clean-btn").show();
    } else {
      $("#npm-install-btn").hide();
      $("#npm-cache-clean-btn").hide();
    }

    if (index === 3) {
      $("#nrm-add-btn").show();
    } else {
      $("#nrm-add-btn").hide();
    }

    return false;
  });

  // 远程tab页签搜索
  form.on("submit(node-net-table-search)", function (data) {
    const field = data.field;
    if (!field.version && !field.type) {
      initNetNodeTable();
      return false;
    }

    netNodeTableSearch(field.version, field.type);
    return false;
  });

  // nvm配置
  // 设置proxy
  form.on("submit(set-proxy-btn)", function () {
    layer.prompt({ title: "请输入代理地址" }, function (value, index, elem) {
      setNvmProxy(value.trim());
      layer.close(index);
    });

    return false;
  });

  // 设置node mirror
  form.on("submit(set-nodeMirror-btn)", function () {
    layer.prompt({ title: "默认为https://nodejs.org/dist/" }, function (value, index, elem) {
      if (!value.trim()) {
        value = "https://nodejs.org/dist/";
      }

      setNvmNodeMirror(value.trim());
      layer.close(index);
    });

    return false;
  });

  // 设置npm mirror
  form.on("submit(set-npmMirror-btn)", function () {
    layer.prompt({ title: "默认为https://github.com/npm/npm/archive/" }, function (value, index, elem) {
      if (!value.trim()) {
        value = "https://github.com/npm/npm/archive/";
      }

      setNvmNpmMirror(value.trim());
      layer.close(index);
    });

    return false;
  });
});
