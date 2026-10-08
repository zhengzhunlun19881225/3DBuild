# 天空球时间控制器

园区总览和航拍巡游顶部天气按钮右侧，点击时钟打开悬浮框。可启用/关闭天空球，拖动 00:00–23:59 时间，选择日出、正午、日落、夜晚，调整云量，或按 1/3/5/10 分钟一天自动循环。默认 18:00 日落。暂停、拖动和选预设均立即生效；设置保存到本机，刷新时自动播放保持暂停。

天空使用已有 Three.js 0.186.0 的官方 `three/addons/objects/Sky.js`，MIT 许可，来源 https://github.com/mrdoob/three.js ，文档 https://threejs.org/docs/pages/Sky.html 。使用其大气散射、太阳盘和云层，并添加夜间星空混合。太阳位置、主光方向/强度、半球光、环境反射强度、雾色和地面色随时间变化，保留科技蓝材质。雨雪天气提高云量和浑浊度，并降低太阳光强。天空只在总览和巡游呈现；资源在切换离开园区画布时释放。

实现为 `src/sky/CampusSky.ts`，React 设置为 `src/components/SkyTimeController.tsx`。新控制器应用到两个 Three.js 园区渲染器；Cesium GIS 和 3DGS 保留各自的天空系统。

太阳轨迹为视觉模拟，固定 06:00 日出 / 18:00 日落，不用于真实地理位置和日期的天文计算。自动播放在后台标签页和其他页面暂停推进。官方 MIT 许可保存在 `public/licenses/three-MIT.txt`。
