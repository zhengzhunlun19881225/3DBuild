import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SparkRenderer, SplatMesh } from '@sparkjsdev/spark';
import { defaultScene } from './default-scene.js';
import { downloadScene, describeLoadError } from './scene-download.js';
import { getSplatBounds } from './splat-bounds.js';

const status = document.querySelector('#status');
const progress = document.querySelector('#progress');
const abort = new AbortController();
let renderer, controls, spark, model, objectUrl;
let disposed = false;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#9eb9c8');
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.03, 10000);
const initialPosition = new THREE.Vector3();
const initialTarget = new THREE.Vector3();

function fail(error) {
  if (disposed) return;
  document.body.dataset.state = 'error';
  status.textContent = `场景加载失败：${describeLoadError(error)}`;
  document.querySelector('#retry').hidden = false;
  console.error(error);
}

function resetView() {
  if (document.body.dataset.state !== 'ready') return;
  camera.position.copy(initialPosition);
  controls.target.copy(initialTarget);
  controls.update();
}

function dispose() {
  if (disposed) return;
  disposed = true;
  abort.abort();
  renderer?.setAnimationLoop(null);
  controls?.dispose();
  model?.dispose();
  spark?.dispose();
  renderer?.dispose();
  renderer?.forceContextLoss();
  if (objectUrl) URL.revokeObjectURL(objectUrl);
}

window.addEventListener('pagehide', dispose, { once: true });
window.addEventListener('message', event => {
  if (event.origin === location.origin && event.source === parent && event.data?.type === '3dgs:reset') resetView();
});
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer?.setSize(innerWidth, innerHeight);
});

async function start() {
  renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(innerWidth, innerHeight);
  renderer.domElement.tabIndex = 0;
  document.querySelector('#viewport').appendChild(renderer.domElement);
  renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    renderer.setAnimationLoop(null);
    fail(new Error('显卡上下文已断开，请重新加载场景。'));
  });
  spark = new SparkRenderer({ renderer, lodSplatCount: 1000000 });
  scene.add(spark);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  const blob = await downloadScene(`./scene.ply?v=${defaultScene.version}`, {
    expectedBytes: defaultScene.expectedBytes,
    signal: abort.signal,
    onProgress(received, total) {
      if (disposed) return;
      const percent = Math.floor(received / total * 100);
      progress.value = percent;
      status.textContent = `读取本地场景 ${percent}% · ${(received / 1048576).toFixed(0)} / ${(total / 1048576).toFixed(0)} MB`;
    },
  });
  if (disposed) return;
  progress.removeAttribute('value');
  status.textContent = '正在解析高斯数据并构建细节层级…';
  objectUrl = URL.createObjectURL(blob);
  model = new SplatMesh({ url: objectUrl, fileName: defaultScene.name, fileType: 'ply', lod: true });
  await model.initialized;
  URL.revokeObjectURL(objectUrl);
  objectUrl = null;
  if (disposed) { model.dispose(); return; }

  const bounds = getSplatBounds(model);
  if (bounds.isEmpty() || ![...bounds.min, ...bounds.max].every(Number.isFinite)) throw new Error('模型没有有效坐标。');
  // Preserve the Z-up orientation and source project's survey viewpoint.
  model.rotation.x = -Math.PI / 2;
  model.updateMatrixWorld(true);
  const worldBounds = bounds.clone().applyMatrix4(model.matrixWorld);
  const center = worldBounds.getCenter(new THREE.Vector3());
  model.position.set(-center.x, -worldBounds.min.y, -center.z);
  model.updateMatrixWorld(true);
  const spawn = new THREE.Vector3(0, 0, 2.5).applyMatrix4(model.matrixWorld);
  initialTarget.copy(spawn).add(new THREE.Vector3(0, 8, 0));
  initialPosition.copy(spawn).add(new THREE.Vector3(30, 16, 40));
  scene.add(model);
  document.body.dataset.state = 'ready';
  document.body.dataset.splatCount = String(model.numSplats);
  document.querySelector('#hint').hidden = false;
  resetView();
  renderer.setAnimationLoop(() => {
    if (document.hidden || disposed) return;
    controls.update();
    renderer.render(scene, camera);
  });
}

start().catch(fail);
