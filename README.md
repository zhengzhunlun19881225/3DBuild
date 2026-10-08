<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/b8ae7970-9828-46f6-af81-d0602e374c25

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

3DBuild 的独立本地预览地址为 http://127.0.0.1:5186/。
开发服务和构建预览均固定使用 5186；端口被占用时会报错，不会自动切换端口。请保持服务终端运行。

默认园区已接入根目录 OBJ，提供科技金属 / 全息蓝图材质、8 栋楼栋选择和 35 个楼层的结构剖切。材质来源、MIT 许可和模型更新说明见 [园区模型与开源材质](docs/campus-materials.md)。

天气按钮右侧新增天空时间控制器，支持日出、正午、日落、夜晚、时间滑杆、云量与自动昼夜循环，天空和园区光照同步变化。使用 Three.js 官方 Sky 模块，详见 [天空时间控制器](docs/campus-sky.md)。

## GitHub Pages

仓库：https://github.com/zhengzhunlun19881225/3DBuild

发布地址：https://zhengzhunlun19881225.github.io/3DBuild/

推送到 `main` 会通过 `.github/workflows/pages.yml` 构建并部署。首次需在仓库 Settings → Pages 将 Source 设为 GitHub Actions。构建使用 Node.js 24 和 pnpm 11.25.0。GIS 和 3DGS 使用相对路径，兼容 `/3DBuild/` 子目录。

445 MB 的原始 PLY 不纳入 Git；`public/3dgs/scene-parts` 包含 7 个分片，每个低于 GitHub 单文件限制。浏览器顺序下载、验证 SHA-256 并完整还原模型，保留原有碰撞版本与人物漫游功能。模型首次加载仍需下载约 445 MB。

更新 PLY 时执行 `node scripts/prepare-scene-parts.mjs`，再执行 `npm run build:3dgs`，将更新后的清单、分片及嵌入产物一起提交。更新园区 OBJ/材质后执行 `npm run build:gis`。发布使用已生成的模型资源及 3DGS 产物，不依赖其他本地项目。

本地检查发布产物：`npm run lint`、`node --test integrations/3dgs/tests/scene-parts.test.js`、`npm run build`、`node scripts/prepare-pages.mjs`。
