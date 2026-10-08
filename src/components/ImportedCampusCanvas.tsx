import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { ThreeCampusCanvasProps } from './ThreeCampusCanvas';
import { importedBuildings, MODEL_OFFSET, MODEL_SCALE } from '../models/importedCampus';
import { createCampusMaterials, isCampusRoof, MaterialStyle } from '../materials/campusMaterials';
import modelUrl from '../../campus_aerial_estimated_scale.obj?url';
import { CampusWeather } from '../weather/CampusWeather';
import type { WeatherSettings } from '../types/weather';
import { CampusSky } from '../sky/CampusSky';
import { DEFAULT_SKY, formatSkyTime } from '../types/sky';

type Props = ThreeCampusCanvasProps & { resetToken: number; weather: WeatherSettings };
type ModelMesh = THREE.Mesh<THREE.BufferGeometry, THREE.Material>;

export function ImportedCampusCanvas(props: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const current = useRef(props);
  current.current = props;
  const [style, setStyle] = useState<MaterialStyle>('metal');
  const styleRef = useRef(style);
  styleRef.current = style;
  const [status, setStatus] = useState('正在加载园区模型');
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [labelsVisible, setLabelsVisible] = useState(true);
  const labelsVisibleRef = useRef(true);
  labelsVisibleRef.current = labelsVisible;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let alive = true;
    const abort = new AbortController();
    let frame = 0;
    let root: THREE.Group | undefined;
    let lastView = '';
    let lastFramed = '';
    let lastAppearance = '';
    let fitting = true;
    let width = container.clientWidth;
    let height = container.clientHeight;
    const meshes: ModelMesh[] = [];
    const outlines: THREE.LineSegments[] = [];
    const holograms: ModelMesh[] = [];
    const buildingBounds = new Map<string, THREE.Box3>();
    const floorBounds = new Map<string, THREE.Box3>();
    const labels: { node: HTMLButtonElement; position: THREE.Vector3; id: string }[] = [];
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 20000);
    camera.position.set(100, 95, 125);
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch {
      setStatus('浏览器无法创建 WebGL 场景，请启用硬件加速后重试。');
      setError(true);
      return;
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);
    const labelLayer = document.createElement('div');
    labelLayer.className = 'absolute inset-0 pointer-events-none overflow-hidden';
    container.appendChild(labelLayer);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 3;
    controls.maxDistance = 320;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.autoRotateSpeed = 0.5;
    const stopFit = () => { fitting = false; };
    controls.addEventListener('start', stopFit);
    const desiredPosition = camera.position.clone();
    const desiredTarget = new THREE.Vector3(0, 3, 0);
    const materials = createCampusMaterials();
    const weatherEffects = new CampusWeather(scene);
    const hemi = new THREE.HemisphereLight('#bcefff', '#182a45', 2.4);
    scene.add(hemi);
    const key = new THREE.DirectionalLight('#e0f2fe', 3.4);
    key.position.set(-45, 85, 40);
    scene.add(key);
    const rim = new THREE.DirectionalLight('#38bdf8', 2.8);
    rim.position.set(60, 45, -50);
    scene.add(rim);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.05);
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.65;
    room.dispose();
    pmrem.dispose();
    const skyEffects = new CampusSky(scene, renderer, hemi, key, rim);

    const renderTarget = new THREE.WebGLRenderTarget(width, height, { type: THREE.HalfFloatType });
    renderTarget.samples = Math.min(renderer.capabilities.maxSamples, 4);
    const composer = new EffectComposer(renderer, renderTarget);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.35, 0.55, 0.85);
    composer.addPass(bloom);
    const output = new OutputPass();
    composer.addPass(output);

    const grid = new THREE.GridHelper(500, 100, '#16475e', '#102b3e');
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.3;
    grid.position.y = -0.35;
    scene.add(grid);
    const baseMaterial = new THREE.MeshBasicMaterial({ color: '#050f1d' });
    const dayGround = new THREE.Color('#627e93');
    const base = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), baseMaterial);
    base.rotation.x = -Math.PI / 2;
    base.position.y = -0.36;
    scene.add(base);
    const scan = new THREE.Mesh(
      new THREE.RingGeometry(0.985, 1, 128),
      new THREE.MeshBasicMaterial({ color: '#22d3ee', transparent: true, opacity: 0.24, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }),
    );
    scan.rotation.x = -Math.PI / 2;
    scan.position.y = 0.16;
    scene.add(scan);

    function frameBounds(bounds: THREE.Box3, overview: boolean) {
      const center = bounds.getCenter(new THREE.Vector3());
      const size = bounds.getSize(new THREE.Vector3());
      const freeWidth = overview ? Math.max(width * 0.38, width - 760) : Math.max(width * 0.6, width - 390);
      const usableAspect = freeWidth / height;
      const fov = THREE.MathUtils.degToRad(camera.fov);
      const span = Math.max(size.x, size.z, size.y * 1.2, 8);
      const distance = Math.max(span / (2 * Math.tan(fov / 2) * usableAspect), span * 1.5) * (overview ? 1.25 : 1.12);
      desiredTarget.copy(center);
      desiredPosition.copy(center).add(new THREE.Vector3(0.45, 0.85, 1.1).normalize().multiplyScalar(distance));
      fitting = true;
    }

    const load = async () => {
      setError(false);
      setStatus('正在加载园区模型');
      try {
        const response = await fetch(modelUrl, { signal: abort.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const text = await response.text();
        if (!alive) return;
        const model = new OBJLoader().parse(text);
        root = model;
        root.name = 'Imported campus · 8 buildings · 35 floors';
        const oldMaterials = new Set<THREE.Material>();
        const children = [...root.children];
        for (const child of children) {
          if (!(child instanceof THREE.Mesh)) continue;
          const mesh = child as ModelMesh;
          (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(m => oldMaterials.add(m));
          mesh.geometry.translate(-MODEL_OFFSET[0], -MODEL_OFFSET[1], -MODEL_OFFSET[2]);
          mesh.geometry.scale(MODEL_SCALE, MODEL_SCALE, MODEL_SCALE);
          mesh.geometry.computeBoundingBox();
          mesh.geometry.computeBoundingSphere();
          mesh.material = materials.forName(mesh.name);
          const match = mesh.name.match(/^Campus_(A|B1|B2|C1|C2|C3|D|E)_/);
          const floorMatch = mesh.name.match(/_F(\d+)_/);
          const id = match ? `obj-${match[1]}` : '';
          mesh.userData = { buildingId: id, floor: floorMatch ? Number(floorMatch[1]) : null };
          meshes.push(mesh);
          if (id) {
            const bounds = mesh.geometry.boundingBox!;
            if (!buildingBounds.has(id)) buildingBounds.set(id, new THREE.Box3());
            buildingBounds.get(id)!.union(bounds);
            if (floorMatch) {
              const k = `${id}:${Number(floorMatch[1])}`;
              if (!floorBounds.has(k)) floorBounds.set(k, new THREE.Box3());
              floorBounds.get(k)!.union(bounds);
            }
            if (/Structure|Envelope/.test(mesh.name) && !/Louver|Frame/.test(mesh.name)) {
              const edge = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 35), materials.edges);
              edge.userData = mesh.userData;
              mesh.add(edge);
              outlines.push(edge);
            }
            if (/Glass/.test(mesh.name)) {
              const holo = new THREE.Mesh(mesh.geometry, materials.hologram);
              holo.raycast = () => {};
              mesh.add(holo);
              holograms.push(holo);
            }
          }
        }
        oldMaterials.forEach(m => m.dispose());
        scene.add(model);
        weatherEffects.attachSurfaces(meshes, buildingBounds);
        for (const building of importedBuildings) {
          const bounds = buildingBounds.get(building.id)!;
          const position = bounds.getCenter(new THREE.Vector3());
          position.y = bounds.max.y + 1.8;
          const node = document.createElement('button');
          node.type = 'button';
          node.textContent = `${building.code}  /  ${building.floorsCount}F`;
          node.title = `查看 ${building.name} · ${building.floorsCount} 层`;
          node.setAttribute('aria-label', `在模型中选择 ${building.name}`);
          node.className = 'absolute pointer-events-auto rounded border border-cyan-400/40 bg-slate-950/85 px-2 py-1 text-[10px] font-mono tracking-wider text-cyan-100 shadow-lg backdrop-blur hover:bg-cyan-900/90';
          node.addEventListener('click', () => current.current.onSelectBuilding(building));
          labelLayer.appendChild(node);
          labels.push({ node, position, id: building.id });
        }
        container.dataset.modelLoaded = 'true';
        container.dataset.buildingCount = String(buildingBounds.size);
        container.dataset.floorCount = String(floorBounds.size);
        setStatus('');
      } catch (err) {
        if (!alive || abort.signal.aborted) return;
        console.error('Campus model load failed', err);
        setStatus('园区模型加载失败，请重试。');
        setError(true);
      }
    };
    void load();

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDown = new THREE.Vector2();
    function pick(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(meshes.filter(m => m.visible), false)[0]?.object as ModelMesh | undefined;
    }
    const down = (event: PointerEvent) => { pointerDown.set(event.clientX, event.clientY); };
    const up = (event: PointerEvent) => {
      if (event.button !== 0 || pointerDown.distanceTo(new THREE.Vector2(event.clientX, event.clientY)) > 5) return;
      const hit = pick(event);
      if (!hit?.userData.buildingId) return;
      const p = current.current;
      if (p.viewLevel === 'building' && hit.userData.buildingId === p.selectedBuildingId && hit.userData.floor) {
        p.onSelectFloor(hit.userData.floor);
      } else {
        const building = importedBuildings.find(b => b.id === hit.userData.buildingId);
        if (building) p.onSelectBuilding(building);
      }
    };
    let hoverAt = 0;
    const move = (event: PointerEvent) => {
      if (event.buttons || performance.now() - hoverAt < 90) return;
      hoverAt = performance.now();
      const hit = pick(event);
      const building = importedBuildings.find(b => b.id === hit?.userData.buildingId);
      renderer.domElement.style.cursor = building ? 'pointer' : 'grab';
      current.current.onHoverObject(building ? {
        name: building.name, type: hit?.userData.floor ? `F${hit.userData.floor} · 点击查看` : `${building.floorsCount} 层`,
        x: event.clientX, y: event.clientY,
      } : null);
    };
    const leave = () => current.current.onHoverObject(null);
    renderer.domElement.addEventListener('pointerdown', down);
    renderer.domElement.addEventListener('pointerup', up);
    renderer.domElement.addEventListener('pointermove', move);
    renderer.domElement.addEventListener('pointerleave', leave);
    const resize = new ResizeObserver(() => {
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      composer.setSize(width, height);
      lastView = '';
      lastFramed = '';
    });
    resize.observe(container);
    const started = performance.now();
    let lastTime = started;
    let tourTime = 0;
    const projected = new THREE.Vector3();
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const time = (now - started) / 1000;
      const p = current.current;
      const dark = p.themeMode === 'dark';
      const appearance = `${dark}:${styleRef.current}`;
      if (appearance !== lastAppearance) {
        lastAppearance = appearance;
        materials.setTheme(dark);
        scene.background = new THREE.Color(dark ? '#040d1a' : '#d5e2ed');
        scene.fog = new THREE.FogExp2(dark ? '#040d1a' : '#d5e2ed', 0.0018);
        baseMaterial.color.set(dark ? '#050f1d' : '#c4d6df');
        bloom.strength = dark ? 0.25 : 0.1;
        bloom.threshold = 1.1;
        materials.hologram.uniforms.intensity.value = styleRef.current === 'hologram' ? 0.15 : 0.22;
        materials.roofHologram.uniforms.intensity.value = materials.hologram.uniforms.intensity.value;
        lastView = '';
      }
      materials.hologram.uniforms.time.value = time;
      materials.roofHologram.uniforms.time.value = time;
      const radius = 8 + (time * 3) % 62;
      scan.scale.setScalar(radius);
      (scan.material as THREE.MeshBasicMaterial).opacity = (1 - (radius - 8) / 62) * (dark ? 0.16 : 0.05);
      scan.visible = p.viewLevel === 'overview';
      const view = `${p.viewLevel}:${p.selectedBuildingId}:${p.selectedFloor}:${p.resetToken}:${p.showSurroundingBuildings}`;
      if (root && view !== lastView) {
        lastView = view;
        const overview = p.viewLevel === 'overview' || p.viewLevel === 'roam';
        const cut = p.viewLevel === 'floor' || p.viewLevel === 'room';
        const allBounds = new THREE.Box3();
        buildingBounds.forEach(b => allBounds.union(b));
        for (const mesh of meshes) {
          const { buildingId, floor } = mesh.userData;
          const context = /SurroundingBuildings/.test(mesh.name);
          mesh.visible = context ? overview && p.showSurroundingBuildings !== false : true;
          if (buildingId && !overview) mesh.visible = buildingId === p.selectedBuildingId;
          if (cut && buildingId === p.selectedBuildingId) {
            mesh.visible = floor !== null && floor <= p.selectedFloor;
          }
          if (!overview && !buildingId) mesh.visible = false;
          const holoMode = styleRef.current === 'hologram' && !!buildingId;
          const baseSurface = holoMode
            ? (isCampusRoof(mesh.name) ? materials.roofHologram : materials.hologram)
            : materials.forName(mesh.name);
          mesh.material = weatherEffects.materialFor(baseSurface, mesh.name);
        }
        outlines.forEach(edge => {
          edge.material = cut && edge.userData.floor === p.selectedFloor ? materials.selectedEdges : materials.edges;
        });
        holograms.forEach(holo => { holo.visible = styleRef.current !== 'hologram'; });
        const selectedBounds = cut
          ? floorBounds.get(`${p.selectedBuildingId}:${p.selectedFloor}`)
          : buildingBounds.get(p.selectedBuildingId ?? '');
        const frameKey = `${p.viewLevel}:${p.selectedBuildingId}:${p.selectedFloor}:${p.resetToken}`;
        if (frameKey !== lastFramed) {
          lastFramed = frameKey;
          frameBounds(overview ? allBounds : selectedBounds ?? allBounds, overview);
        }
        container.dataset.viewLevel = p.viewLevel;
        container.dataset.visibleBuildings = [...new Set(meshes.filter(m => m.visible && m.userData.buildingId).map(m => m.userData.buildingId))].join(',');
        container.dataset.visibleFloors = [...new Set(meshes.filter(m => m.visible && m.userData.floor).map(m => `${m.userData.buildingId}:${m.userData.floor}`))].join(',');
      }
      controls.autoRotate = p.isAutoRotating && p.viewLevel !== 'roam' && !fitting;
      controls.enabled = p.viewLevel !== 'roam';
      if (p.viewLevel === 'roam' && buildingBounds.size) {
        if (p.isPatrolling) tourTime += delta;
        const index = Math.floor(tourTime / 10) % importedBuildings.length;
        const bounds = buildingBounds.get(importedBuildings[index].id)!;
        const center = bounds.getCenter(new THREE.Vector3());
        const size = bounds.getSize(new THREE.Vector3());
        const angle = tourTime * 0.13;
        const r = Math.max(size.x, size.z, 14) * (p.roamPerspective === 'fpv' ? 1.2 : 1.9);
        desiredTarget.copy(center);
        desiredPosition.set(center.x + Math.sin(angle) * r, bounds.max.y + r * 0.7, center.z + Math.cos(angle) * r);
        fitting = true;
      }
      if (fitting) {
        const lerp = 1 - Math.exp(-delta * 3.2);
        camera.position.lerp(desiredPosition, lerp);
        controls.target.lerp(desiredTarget, lerp);
        if (camera.position.distanceTo(desiredPosition) < 0.05 && p.viewLevel !== 'roam') fitting = false;
      }
      controls.update();
      const outdoor = p.viewLevel === 'overview' || p.viewLevel === 'roam';
      const skySettings = p.sky ?? DEFAULT_SKY;
      skyEffects.update(skySettings, delta, dark, outdoor, p.weather.mode !== 'clear');
      base.scale.setScalar(skySettings.enabled && outdoor ? .25 : 1);
      if (skySettings.enabled && outdoor) {
        const daylight = THREE.MathUtils.smoothstep(Math.sin((skySettings.minutes / 60 - 6) / 24 * Math.PI * 2), -.1, .35);
        baseMaterial.color.set(dark ? '#050f1d' : '#c4d6df').lerp(dayGround, daylight * (dark ? .35 : .6));
      } else baseMaterial.color.set(dark ? '#050f1d' : '#c4d6df');
      weatherEffects.update(delta, p.weather, outdoor, height * renderer.getPixelRatio());
      // Bright snow should read as a surface, not bloom across the entire campus.
      const snowScene = outdoor && p.weather.mode === 'snow' && p.weather.groundEffect;
      bloom.threshold = snowScene ? 4 : 1.1;
      bloom.strength = snowScene ? 0.08 : dark ? 0.25 : 0.1;
      container.dataset.weatherMode = p.weather.mode;
      container.dataset.weatherGround = String(p.weather.groundEffect);
      container.dataset.weatherPaused = String(p.weather.paused);
      container.dataset.skyEnabled = String(skySettings.enabled && outdoor);
      container.dataset.skyTime = formatSkyTime(skySettings.minutes);
      for (const label of labels) {
        projected.copy(label.position).project(camera);
        const visible = labelsVisibleRef.current && p.viewLevel === 'overview' && projected.z < 1 && projected.z > -1;
        label.node.style.display = visible ? '' : 'none';
        if (visible) label.node.style.transform = `translate(-50%, -100%) translate(${(projected.x + 1) * width / 2}px, ${(1 - projected.y) * height / 2}px)`;
      }
      composer.render();
    };
    animate();

    return () => {
      alive = false;
      abort.abort();
      cancelAnimationFrame(frame);
      resize.disconnect();
      controls.dispose();
      weatherEffects.dispose();
      skyEffects.dispose();
      renderer.domElement.removeEventListener('pointerdown', down);
      renderer.domElement.removeEventListener('pointerup', up);
      renderer.domElement.removeEventListener('pointermove', move);
      renderer.domElement.removeEventListener('pointerleave', leave);
      const geometries = new Set<THREE.BufferGeometry>();
      scene.traverse(node => {
        if (node instanceof THREE.Mesh || node instanceof THREE.LineSegments) geometries.add(node.geometry);
      });
      geometries.forEach(g => g.dispose());
      materials.dispose();
      baseMaterial.dispose();
      (scan.material as THREE.Material).dispose();
      (grid.material as THREE.Material).dispose();
      environment.dispose();
      bloom.dispose();
      output.dispose();
      composer.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      labelLayer.remove();
      delete container.dataset.modelLoaded;
    };
  }, [retry]);

  return <>
    <div ref={containerRef} id="digital-twin-3d-canvas" className="absolute inset-0" aria-label="导入园区三维模型" />
    {status && <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
      <div role={error ? 'alert' : 'status'} className="rounded-2xl border border-cyan-400/30 bg-slate-950/95 px-8 py-6 text-center text-cyan-100 shadow-2xl">
        <div className="text-sm tracking-widest">{status}</div>
        {!error && <div className="mt-3 h-0.5 w-44 animate-pulse bg-cyan-400" />}
        {error && <button className="mt-4 rounded bg-cyan-600 px-4 py-2 pointer-events-auto" onClick={() => setRetry(n => n + 1)}>重新加载</button>}
      </div>
    </div>}
    <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
      <div className="text-[10px] tracking-[0.18em] text-cyan-200/65 rounded-full bg-slate-950/75 px-3 py-1">8 栋建筑 · 35 个楼层 · 运营指标为演示数据</div>
      <div className="flex items-center gap-1 rounded-xl border border-cyan-500/25 bg-slate-950/90 p-1.5 shadow-2xl backdrop-blur pointer-events-auto">
        {(['metal', 'hologram'] as const).map(value => <button key={value} aria-pressed={style === value} onClick={() => setStyle(value)} className={`rounded-lg px-4 py-2 text-xs transition ${style === value ? 'bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20' : 'text-slate-300 hover:bg-slate-800'}`}>{value === 'metal' ? '科技金属' : '全息蓝图'}</button>)}
        <span className="mx-1 h-4 border-l border-slate-700" />
        <button aria-pressed={labelsVisible} onClick={() => setLabelsVisible(v => !v)} className="px-3 py-2 text-xs text-cyan-100">{labelsVisible ? '隐藏楼栋标注' : '显示楼栋标注'}</button>
      </div>
      <div className="text-[10px] text-slate-400">拖动旋转 · 滚轮缩放 · 右键平移 · 点击楼栋查看</div>
    </div>
  </>;
}
