# 园区模型与开源材质

当前默认园区使用项目根目录的 `campus_aerial_estimated_scale.obj`，保留原文件。模型具有 8 栋建筑、35 个楼层、294 个对象。OBJ 没有配套 MTL，因此新效果是代码材质，不是原模型贴图的复原，也不依赖外部 CDN。

## 已采用的 GitHub 开源方案

| 来源 | 许可 | 在项目中的用途 |
| --- | --- | --- |
| [mrdoob/three.js](https://github.com/mrdoob/three.js) | MIT | MeshPhysicalMaterial 金属/镀膜玻璃、RoomEnvironment 环境反射、UnrealBloomPass 辉光、OBJLoader、OrbitControls |
| [ektogamat/threejs-holographic-material](https://github.com/ektogamat/threejs-holographic-material) | MIT，Copyright (c) 2023 Anderson Mancini dos Santos | 改写其 Fresnel 与扫描线思路为原生 Three.js ShaderMaterial，用于玻璃扫描和全息蓝图模式 |

全息改写去掉 React Three Fiber 依赖、闪烁与 UV 依赖，修正世界坐标变换，采用世界高度扫描并限制叠加亮度。建筑实体使用 Three.js 物理材质，配色与参数为本项目定制。未下载或使用无许可贴图库。

完整许可随构建分发于 `public/licenses/three-MIT.txt` 和 `public/licenses/holographic-material-MIT.txt`。材质参数位于 `src/materials/campusMaterials.ts`。

## 模型与交互

- 默认展示科技金属；底部可切换全息蓝图，并显隐楼栋标注。
- 点击模型或列表进入对应楼栋，点击楼层按钮或外立面进入剖切。上层及屋面隐藏；较低楼层保留；目标层轮廓高亮。
- 楼栋按 A、B1、B2、C1、C2、C3、D、E 对应模型对象名称，未沿用旧示例楼栋 ID。
- 模型没有房间边界与业务数据，不生成虚构房间。总览的运营与监控面板仍为演示数据，页面已有标注。
- 航拍巡游围绕真实楼栋自动取景，可暂停；它是展示镜头，不是经过导航网格验证的机器人地面巡检。
- 模型名称注明比例为估算值，不据此宣称真实建筑面积。

开发/预览继续使用 http://127.0.0.1:5186/。

替换 OBJ 后运行 `node scripts/inspect-campus.mjs` 更新几何边界和楼层索引。若新模型命名规则不同，需要同步调整该脚本与 `ImportedCampusCanvas.tsx` 的楼栋分组正则。
