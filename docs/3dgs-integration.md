# 3DGS 场景菜单

顶部“3DGS”切换到实景浏览及可收起的左侧功能面板，保留宿主顶部导航。面板包含自由/第一/第三人称、人物模型、时间与天空、天气与地面雨雪、漫游设置、交互与物理。人物使用源项目 Xbot GLB 与动作适配，加载匹配的地形碰撞后开放漫游。“显示人物”进入第三人称，WASD 移动、Shift 奔跑、空格跳跃、F 飞行。

宿主右上角重置按钮在自由浏览时恢复视角，在人物漫游时重置玩家。“园区总览”返回原园区。

入口 `3dgs/index.html` 和模型都由本项目提供，无需启动其他项目。本地预览使用 5186 端口，GitHub Pages 使用 `/3DBuild/` 子目录。首次打开时读取场景分片并还原约 445 MB 的 PLY，逐片校验 SHA-256 后构建 LOD，期间显示加载状态和失败重试。切换离开时 iframe 卸载，取消下载并释放 WebGL 资源。

来源：用户指定的本地 `../3DGS` 项目。复制其完整 `src`、页面模板、依赖清单和模型资源，沿用 Z-up 变换、初始视角、Spark LOD、人物动画及地形碰撞设置。未修改源项目代码。

完整功能源码快照在 `integrations/3dgs`，其 Vite 构建写入 `public/3dgs`。开发环境借用源项目已安装的 `node_modules`（符号链接）；独立迁移时可按目录中的 package.json / pnpm-lock.yaml 安装依赖。修改嵌入源码后，在宿主运行 `npm run build:3dgs`，再运行 `npm run build`。嵌入样式在 `src/embedded.css`，菜单桥接与资源释放在 `src/main.js`。

`characters`、`collision`、`tiles-demo`、`third-party` 来自原项目的模型目录；人物来源说明在 `characters/SOURCE.md`。独立 iframe 避免与园区主应用的 Three.js 版本混用。`public` 随 Vite 构建完整复制到产物，生产预览不依赖源项目或外部 CDN。
