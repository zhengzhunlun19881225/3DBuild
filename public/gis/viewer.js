const C = window.Cesium;
const $ = id => document.getElementById(id);
const STORAGE = 'campus-cesium-placement-v1';
// Baidu address-search map centre for 笔村大路78号, BD09MC -> WGS84.
// Address-level anchor only; parcel centre, heading and scale require survey control.
const defaults = { longitude: 113.528691, latitude: 23.111421, heading: 10, height: 1, scale: 1 };
let placement = { ...defaults }, saved = false;
const valid = p => p && Object.keys(defaults).every(k => Number.isFinite(p[k])) && Math.abs(p.longitude) <= 180 && Math.abs(p.latitude) <= 85 && p.scale >= .05 && p.scale <= 10 && p.height >= 0 && p.height <= 9000 && Math.abs(p.heading) <= 360;
try { const p = JSON.parse(localStorage.getItem(STORAGE)); if (valid(p)) { placement = p; saved = true; } } catch {}
let viewer, selected, disposed = false, labelsVisible = true, matrix;
const models = new Map(), labels = new Map();
const floors = { A: 8, B1: 4, B2: 4, C1: 4, C2: 4, C3: 4, D: 6, E: 1 };
const abort = new AbortController();
function status(message) { $('status').textContent = message; $('status').hidden = !message; }
function syncFields() {
  for (const key of Object.keys(defaults)) $('position-form').elements.namedItem(key).value = placement[key];
  $('accuracy').textContent = saved ? '已应用本机校准 · 非测绘定位' : '地址级定位 · 朝向与尺寸待校准';
  $('coords').textContent = `${placement.longitude.toFixed(6)}° E / ${placement.latitude.toFixed(6)}° N`;
}
function updatePlacement() {
  matrix = C.Transforms.headingPitchRollToFixedFrame(C.Cartesian3.fromDegrees(placement.longitude, placement.latitude, placement.height), new C.HeadingPitchRoll(C.Math.toRadians(placement.heading), 0, 0));
  for (const [code, item] of models) {
    item.model.modelMatrix = matrix;
    item.model.scale = placement.scale;
    if (labels.has(code)) {
      const p = item.meta.center;
      // glTF +Y is up, +Z is south, after Cesium's Y-up conversion.
      labels.get(code).position = C.Matrix4.multiplyByPoint(matrix, new C.Cartesian3(p[0] * placement.scale, -p[2] * placement.scale, (item.meta.maxY + 5) * placement.scale), new C.Cartesian3());
    }
  }
  syncFields();
  viewer.scene.requestRender();
}
function frame(kind = 'home') {
  if (!viewer || viewer.isDestroyed()) return;
  const range = kind === 'around' ? 2400 : kind === 'top' ? 610 : 620;
  viewer.camera.flyToBoundingSphere(new C.BoundingSphere(C.Cartesian3.fromDegrees(placement.longitude, placement.latitude, placement.height + 12), 190 * placement.scale), {
    duration: 1.1, offset: new C.HeadingPitchRange(C.Math.toRadians(placement.heading + (kind === 'top' ? 0 : 12)), C.Math.toRadians(kind === 'top' ? -89.9 : -43), range * placement.scale),
  });
}
function clearSelection() {
  if (selected && models.has(selected)) models.get(selected).model.silhouetteSize = 0;
  selected = null; $('selection').hidden = true; viewer?.scene.requestRender();
}
async function loadBasemap() {
  try {
    const provider = await C.ArcGisMapServerImageryProvider.fromUrl(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
      { enablePickFeatures: false, maximumLevel: 19 },
    );
    if (disposed) return;
    // Navy-tint satellite imagery only; retain terrain detail and model colors.
    const requestImage = provider.requestImage.bind(provider);
    provider.requestImage = (x, y, level, request) => {
      const image = requestImage(x, y, level, request);
      if (!image) return undefined;
      return Promise.resolve(image).then(source => {
        const canvas = document.createElement('canvas'); canvas.width = source.width; canvas.height = source.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true }); ctx.drawImage(source, 0, 0);
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height), d = pixels.data;
        for (let i = 0; i < d.length; i += 4) {
          const luminance = d[i] * .299 + d[i + 1] * .587 + d[i + 2] * .114;
          d[i] = 5 + luminance * .23;
          d[i + 1] = 14 + luminance * .32;
          d[i + 2] = 25 + luminance * .43;
        }
        ctx.putImageData(pixels, 0, 0);
        document.body.dataset.mapState = 'ready';
        return canvas;
      });
    };
    viewer.imageryLayers.addImageryProvider(provider);
    provider.errorEvent.addEventListener(error => {
      document.body.dataset.mapState = 'error';
      console.warn('GIS tile:', error.message);
      status('部分卫星底图加载失败，可刷新重试。');
      $('retry').hidden = false;
    });
    viewer.scene.requestRender();
  } catch (error) {
    if (disposed) return;
    document.body.dataset.mapState = 'error';
    status('卫星底图暂时无法连接，园区模型仍可浏览。');
    $('retry').hidden = false;
    console.warn('GIS basemap:', error);
  }
}
async function start() {
  if (!C) throw new Error('Cesium 资源未加载，请重试。');
  C.Ion.defaultAccessToken = '';
  viewer = new C.Viewer('map', {
    baseLayer: false, terrainProvider: new C.EllipsoidTerrainProvider(),
    animation: false, timeline: false, baseLayerPicker: false, geocoder: false, homeButton: false,
    sceneModePicker: false, navigationHelpButton: false, fullscreenButton: false,
    selectionIndicator: false, infoBox: false, requestRenderMode: true, maximumRenderTimeChange: Infinity,
    skyBox: false, skyAtmosphere: false, shadows: false,
  });
  viewer.resolutionScale = Math.min(devicePixelRatio, 1.5) / devicePixelRatio;
  const scene = viewer.scene;
  scene.backgroundColor = C.Color.fromCssColorString('#020817');
  scene.globe.baseColor = C.Color.fromCssColorString('#071625');
  scene.globe.enableLighting = false;
  scene.globe.depthTestAgainstTerrain = false;
  scene.fog.enabled = false;
  if (scene.sun) scene.sun.show = false;
  if (scene.moon) scene.moon.show = false;
  scene.highDynamicRange = false;
  scene.light = new C.DirectionalLight({ direction: new C.Cartesian3(-.4, -.5, -.8), intensity: 2.3 });
  scene.screenSpaceCameraController.minimumZoomDistance = 25;
  scene.screenSpaceCameraController.maximumZoomDistance = 20000000;
  // Load the map independently so a network outage cannot block local models.
  void loadBasemap();
  status('正在加载园区模型…');
  updatePlacement(); frame();
  const response = await fetch('./models.json', { signal: abort.signal });
  if (!response.ok) throw new Error('模型清单加载失败');
  const manifest = await response.json();
  for (const meta of manifest) {
    if (disposed) return;
    const model = await C.Model.fromGltfAsync({
      url: `./${meta.url}`, modelMatrix: matrix, scale: placement.scale,
      upAxis: C.Axis.Y, forwardAxis: C.Axis.X,
      id: meta.code, allowPicking: meta.code !== 'site', minimumPixelSize: 0,
      imageBasedLighting: new C.ImageBasedLighting({ imageBasedLightingFactor: new C.Cartesian2(1.4, .8) }),
      lightColor: new C.Cartesian3(2.1, 2.4, 2.8),
      silhouetteColor: C.Color.fromCssColorString('#67e8f9'),
    });
    if (disposed) { model.destroy(); return; }
    scene.primitives.add(model);
    models.set(meta.code, { model, meta });
    if (meta.code !== 'site') labels.set(meta.code, viewer.entities.add({
      id: meta.code, label: {
        text: `${meta.code} / ${floors[meta.code]}F`, font: '12px monospace',
        fillColor: C.Color.fromCssColorString('#c9f5ff'), outlineColor: C.Color.fromCssColorString('#00121f'), outlineWidth: 2,
        style: C.LabelStyle.FILL_AND_OUTLINE, showBackground: true, backgroundColor: C.Color.fromCssColorString('#031724').withAlpha(.94),
        backgroundPadding: new C.Cartesian2(10, 7), verticalOrigin: C.VerticalOrigin.BOTTOM,
        disableDepthTestDistance: Number.POSITIVE_INFINITY, distanceDisplayCondition: new C.DistanceDisplayCondition(0, 1800),
      },
    }));
    status(`正在加载园区模型 ${models.size} / ${manifest.length}`);
  }
  updatePlacement();
  document.body.dataset.state = 'ready';
  status('');
  viewer.screenSpaceEventHandler.setInputAction(event => {
    const picked = scene.pick(event.position);
    const code = typeof picked?.id === 'string' ? picked.id : picked?.id?.id;
    clearSelection();
    if (!floors[code]) return;
    selected = code; models.get(code).model.silhouetteSize = 2;
    $('building-name').textContent = `${code} 栋 · ${floors[code]} 层`;
    $('selection').hidden = false;
    scene.requestRender();
  }, C.ScreenSpaceEventType.LEFT_CLICK);
  viewer.screenSpaceEventHandler.removeInputAction(C.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
}
$('home').onclick = () => frame(); $('top').onclick = () => frame('top'); $('around').onclick = () => frame('around');
$('clear').onclick = clearSelection;
$('detail').onclick = () => { if (selected) parent.postMessage({ type: 'gis:building', code: selected }, location.origin); };
$('labels').onclick = () => {
  labelsVisible = !labelsVisible;
  for (const label of labels.values()) label.show = labelsVisible;
  $('labels').setAttribute('aria-pressed', String(labelsVisible));
  viewer?.scene.requestRender();
};
function toggleCalibration(open) { $('calibration').hidden = !open; $('calibrate').setAttribute('aria-expanded', String(open)); }
$('calibrate').onclick = () => toggleCalibration($('calibration').hidden);
$('close').onclick = () => toggleCalibration(false);
window.addEventListener('keydown', event => { if (event.key === 'Escape') toggleCalibration(false); });
$('position-form').onsubmit = event => {
  event.preventDefault();
  const values = Object.fromEntries(Array.from(new FormData(event.currentTarget), ([k, v]) => [k, Number(v)]));
  if (!valid(values)) return;
  placement = values; saved = true;
  try { localStorage.setItem(STORAGE, JSON.stringify(values)); } catch { status('浏览器无法保存设置，本次调整仍有效。'); }
  updatePlacement(); frame();
};
$('defaults').onclick = () => { placement = { ...defaults }; saved = false; try { localStorage.removeItem(STORAGE); } catch {} updatePlacement(); frame(); };
$('retry').onclick = () => location.reload();
window.addEventListener('message', event => { if (event.origin === location.origin && event.source === parent && event.data?.type === 'gis:reset') frame(); });
window.addEventListener('pagehide', () => { disposed = true; abort.abort(); if (viewer && !viewer.isDestroyed()) viewer.destroy(); }, { once: true });
syncFields();
start().catch(error => { if (!disposed) { document.body.dataset.state = 'error'; status(`加载失败：${error.message}`); $('retry').hidden = false; console.error(error); } });
