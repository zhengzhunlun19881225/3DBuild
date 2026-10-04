# 天气控制器

天气按钮位于园区顶部工具栏「隐藏周边」右侧。点击打开悬浮设置，支持晴天、雨、雪、降水强度、风力、地面效果开关、湿润/积雪覆盖、暂停与恢复晴天。关闭框不会停止天气；Escape 和点击框外均可关闭。进入楼栋/楼层内部视图时自动隐藏天气，回到园区恢复所选设置。

## 来源与适配

参考用户指定的 [ck42bb/procedural-weather-threejs @ 26ad580](https://github.com/ck42bb/procedural-weather-threejs/tree/26ad580)，完整提交为 `26ad580e3ab256f00af9e60e818bffdcfb32aa1e`。

该仓库提供天气系统和着色器参考，并非可直接安装的 npm 天气组件。本项目改写其中 `weather-shaders.md` 的 WebGL 雨雪着色器：雨采用 LineSegments，雪采用 Points，均在顶点着色器内计算下落和风偏，不逐帧遍历粒子。修正为向下运动、显式雨丝顶点标记与有序 smoothstep，适配现有 Three.js WebGLRenderer。最大雨量 12,000 条、雪量 10,000 片，强度为零隐藏粒子。

许可：MIT，Copyright (c) 2026 Kingsley。完整许可保存于 `public/licenses/procedural-weather-MIT.txt`，随构建分发。

## 地面效果

本项目新增模型表面着色器，将雨水湿润、粗糙度降低和动态涟漪叠加到实际道路/广场/地面；雪天按世界坐标噪声与朝上法线覆盖地面及屋顶，不把立面全部染白。不会用一张悬空白色平面盖住建筑。切回晴天逐渐恢复原有材质。

积雪为可调覆盖的视觉模拟，不是具有体积/厚度或质量守恒的物理积雪。雨雪使用楼栋包围盒做简化遮挡，因此对中庭、连廊的遮挡不是精确碰撞。全息模式的地面继续响应天气，透明建筑保留全息着色器。

实现：`src/weather/CampusWeather.ts`、`src/components/WeatherController.tsx`、`src/types/weather.ts`。
