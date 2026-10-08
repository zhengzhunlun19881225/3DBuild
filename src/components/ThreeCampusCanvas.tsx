import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ViewLevel, RoamPerspective, BuildingInfo, RoomData, RobotStatus, ThemeMode } from '../types';
import { CampusEntity } from '../models/campusModel';
import { CAMPUS_BUILDINGS, B1A_FLOORS, PATROL_WAYPOINTS } from '../data/campusData';
import { generateAMapTexture } from '../utils/amapMapGenerator';
import { RooftopCameraNode, ROOFTOP_CAMERAS } from './RooftopSurveillanceModal';
import { CampusSky } from '../sky/CampusSky';
import { DEFAULT_SKY, formatSkyTime, SkySettings } from '../types/sky';

export interface ThreeCampusCanvasProps {
  sky?: SkySettings;
  viewLevel: ViewLevel;
  campus?: CampusEntity;
  selectedBuildingId: string | null;
  selectedFloor: number;
  selectedRoomId: string | null;
  roamPerspective: RoamPerspective;
  isAutoRotating: boolean;
  isPatrolling: boolean;
  themeMode?: ThemeMode;
  showAMapLabels?: boolean;
  showSurroundingBuildings?: boolean;
  showRooftopSurveillance?: boolean;
  onSelectBuilding: (building: BuildingInfo) => void;
  onSelectFloor: (floorNum: number) => void;
  onSelectRoom: (room: RoomData) => void;
  onSelectRooftopCamera?: (camera: RooftopCameraNode) => void;
  onUpdateRobotStatus: (status: Partial<RobotStatus>) => void;
  onHoverObject: (info: { name: string; type: string; x: number; y: number } | null) => void;
}

export const ThreeCampusCanvas: React.FC<ThreeCampusCanvasProps> = ({
  sky = DEFAULT_SKY,
  viewLevel,
  campus,
  selectedBuildingId,
  selectedFloor,
  selectedRoomId,
  roamPerspective,
  isAutoRotating,
  isPatrolling,
  themeMode = 'light',
  showAMapLabels = true,
  showSurroundingBuildings = true,
  showRooftopSurveillance = true,
  onSelectBuilding,
  onSelectFloor,
  onSelectRoom,
  onSelectRooftopCamera,
  onUpdateRobotStatus,
  onHoverObject
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const skyState = useRef({ sky, themeMode });
  skyState.current = { sky, themeMode };

  const themeObjectsRef = useRef<{
    scene?: THREE.Scene;
    ambientLight?: THREE.AmbientLight;
    hemiLight?: THREE.HemisphereLight;
    dirLight?: THREE.DirectionalLight;
    rimLight?: THREE.DirectionalLight;
    groundMat?: THREE.MeshStandardMaterial;
    roadMat?: THREE.MeshStandardMaterial;
    buildingWhiteMat?: THREE.MeshStandardMaterial;
    surroundingGroup?: THREE.Group;
    surroundingBuildingMat?: THREE.MeshStandardMaterial;
    cctvLayerGroup?: THREE.Group;
  }>({});

  // References to keep track of Three.js objects across renders
  const stateRef = useRef({
    viewLevel,
    selectedBuildingId,
    selectedFloor,
    selectedRoomId,
    roamPerspective,
    isAutoRotating,
    isPatrolling,
    onSelectBuilding,
    onSelectFloor,
    onSelectRoom,
    onUpdateRobotStatus,
    onHoverObject,
    camTarget: new THREE.Vector3(0, 3, 0),
    camDesiredPos: new THREE.Vector3(38, 30, 48),
    currentRotAngle: 0.8,
    robotWaypointIndex: 0,
    robotT: 0,
    robotPos: new THREE.Vector3(0, 0.4, 8),
    robotRot: 0,
    isDragging: false,
    prevMousePos: { x: 0, y: 0 },
    orbitAngles: { theta: 0.8, phi: 0.95, radius: 65 },
    panOffset: new THREE.Vector3(0, 0, 0)
  });

  // Keep stateRef up to date with incoming props
  useEffect(() => {
    stateRef.current.viewLevel = viewLevel;
    stateRef.current.selectedBuildingId = selectedBuildingId;
    stateRef.current.selectedFloor = selectedFloor;
    stateRef.current.selectedRoomId = selectedRoomId;
    stateRef.current.roamPerspective = roamPerspective;
    stateRef.current.isAutoRotating = isAutoRotating;
    stateRef.current.isPatrolling = isPatrolling;
    stateRef.current.onSelectBuilding = onSelectBuilding;
    stateRef.current.onSelectFloor = onSelectFloor;
    stateRef.current.onSelectRoom = onSelectRoom;
    stateRef.current.onUpdateRobotStatus = onUpdateRobotStatus;
    stateRef.current.onHoverObject = onHoverObject;
  }, [
    viewLevel,
    selectedBuildingId,
    selectedFloor,
    selectedRoomId,
    roamPerspective,
    isAutoRotating,
    isPatrolling,
    onSelectBuilding,
    onSelectFloor,
    onSelectRoom,
    onUpdateRobotStatus,
    onHoverObject,
    onSelectRooftopCamera
  ]);

  // Handle dynamic theme switching & AMap layer updates in real-time
  useEffect(() => {
    const o = themeObjectsRef.current;
    if (!o.scene || !o.ambientLight || !o.hemiLight || !o.dirLight || !o.groundMat || !o.roadMat || !o.buildingWhiteMat) return;
    const isDark = themeMode === 'dark';

    // Toggle rooftop surveillance layer visibility
    if (o.cctvLayerGroup) {
      o.cctvLayerGroup.visible = showRooftopSurveillance;
    }

    // Regenerate AMap texture to match current theme and label density
    const newAmapTexture = generateAMapTexture({
      themeMode,
      showLabels: showAMapLabels
    });
    if (o.groundMat.map) {
      o.groundMat.map.dispose();
    }
    o.groundMat.map = newAmapTexture;
    o.groundMat.needsUpdate = true;

    // Toggle surrounding city buildings visibility and colors
    if (o.surroundingGroup) {
      o.surroundingGroup.visible = showSurroundingBuildings;
    }
    if (o.surroundingBuildingMat) {
      o.surroundingBuildingMat.color.set(isDark ? '#0f172a' : '#f8fafc');
      o.surroundingBuildingMat.opacity = isDark ? 0.75 : 0.88;
    }

    if (isDark) {
      o.scene.background = new THREE.Color('#070c18'); // AMap midnight horizon
      o.scene.fog = new THREE.FogExp2('#070c18', 0.005);
      o.ambientLight.color.set('#38bdf8');
      o.ambientLight.intensity = 0.5;
      o.hemiLight.color.set('#1e293b');
      o.hemiLight.groundColor.set('#070c18');
      o.hemiLight.intensity = 0.5;
      o.dirLight.color.set('#38bdf8');
      o.dirLight.intensity = 1.2;
      if (o.rimLight) {
        o.rimLight.color.set('#0ea5e9');
        o.rimLight.intensity = 1.2;
      }
      o.roadMat.color.set('#1e293b');
      o.buildingWhiteMat.color.set('#0f172a');
    } else {
      o.scene.background = new THREE.Color('#f1f5f9'); // AMap whitesmoke (远山黛) misty light horizon
      o.scene.fog = new THREE.FogExp2('#f1f5f9', 0.0035);
      o.ambientLight.color.set('#ffffff');
      o.ambientLight.intensity = 0.9;
      o.hemiLight.color.set('#e2e8f0');
      o.hemiLight.groundColor.set('#94a3b8');
      o.hemiLight.intensity = 0.6;
      o.dirLight.color.set('#fffbeb');
      o.dirLight.intensity = 1.6;
      if (o.rimLight) {
        o.rimLight.color.set('#38bdf8');
        o.rimLight.intensity = 0.8;
      }
      o.roadMat.color.set('#cbd5e1');
      o.buildingWhiteMat.color.set('#ffffff');
    }
  }, [themeMode, showAMapLabels, showSurroundingBuildings]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. SCENE SETUP
    const scene = new THREE.Scene();
    const isInitialDark = themeMode === 'dark';
    scene.background = new THREE.Color(isInitialDark ? '#070c18' : '#f1f5f9'); // AMap Whitesmoke light atmosphere or Midnight dark
    scene.fog = new THREE.FogExp2(isInitialDark ? '#070c18' : '#f1f5f9', isInitialDark ? 0.005 : 0.0035);

    // 2. CAMERA SETUP
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 20000);
    camera.position.set(40, 32, 50);

    // 3. RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 4. LIGHTS
    const ambientLight = new THREE.AmbientLight(isInitialDark ? '#38bdf8' : '#ffffff', isInitialDark ? 0.5 : 0.9);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(
      isInitialDark ? '#1e293b' : '#e2e8f0',
      isInitialDark ? '#070c18' : '#94a3b8',
      isInitialDark ? 0.5 : 0.6
    );
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(isInitialDark ? '#38bdf8' : '#fffbeb', isInitialDark ? 1.2 : 1.6);
    dirLight.position.set(45, 60, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 240;
    const shadowD = 65;
    dirLight.shadow.camera.left = -shadowD;
    dirLight.shadow.camera.right = shadowD;
    dirLight.shadow.camera.top = shadowD;
    dirLight.shadow.camera.bottom = -shadowD;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // Accent blue rim light
    const rimLight = new THREE.DirectionalLight(isInitialDark ? '#0ea5e9' : '#38bdf8', isInitialDark ? 1.2 : 0.8);
    rimLight.position.set(-40, 30, -30);
    scene.add(rimLight);

    // 5. MATERIALS PALETTE
    const initialAmapTexture = generateAMapTexture({
      themeMode,
      showLabels: showAMapLabels
    });

    const groundMat = new THREE.MeshStandardMaterial({
      map: initialAmapTexture,
      roughness: 0.85,
      metalness: 0.05
    });

    const roadMat = new THREE.MeshStandardMaterial({
      color: isInitialDark ? '#1e293b' : '#cbd5e1',
      roughness: 0.85,
      metalness: 0.15
    });

    const grassMat = new THREE.MeshStandardMaterial({
      color: '#86efac',
      roughness: 0.9,
      metalness: 0.05
    });

    const waterMat = new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.85
    });

    const buildingWhiteMat = new THREE.MeshStandardMaterial({
      color: isInitialDark ? '#0f172a' : '#ffffff',
      roughness: 0.3,
      metalness: 0.1
    });

    const surroundingBuildingMat = new THREE.MeshStandardMaterial({
      color: isInitialDark ? '#0f172a' : '#f8fafc',
      roughness: 0.4,
      metalness: 0.1,
      transparent: true,
      opacity: isInitialDark ? 0.75 : 0.88
    });

    const surroundingEdgeMat = new THREE.LineBasicMaterial({
      color: isInitialDark ? '#0284c7' : '#cbd5e1',
      linewidth: 1.2
    });

    // 6. ENVIRONMENT GEOMETRY (AMap GIS Terrain, connecting roads, surrounding city massing)
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // Surrounding City Group (AMap 3D Buildings)
    const surroundingGroup = new THREE.Group();
    surroundingGroup.visible = showSurroundingBuildings;
    worldGroup.add(surroundingGroup);

    themeObjectsRef.current = {
      scene,
      ambientLight,
      hemiLight,
      dirLight,
      rimLight,
      groundMat,
      roadMat,
      buildingWhiteMat,
      surroundingGroup,
      surroundingBuildingMat
    };

    const glassMat = new THREE.MeshStandardMaterial({
      color: '#0284c7',
      roughness: 0.1,
      metalness: 0.7,
      transparent: true,
      opacity: 0.65
    });

    const glowEdgeMat = new THREE.LineBasicMaterial({
      color: '#0284c7',
      linewidth: 1.5
    });

    const activeGlowEdgeMat = new THREE.LineBasicMaterial({
      color: '#38bdf8',
      linewidth: 2.5
    });

    // Main Campus Base - Expansive 500x500 AMap Map Tile Plane
    const groundGeo = new THREE.PlaneGeometry(500, 500);
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.05;
    groundMesh.receiveShadow = true;
    worldGroup.add(groundMesh);

    // Circular Central Fountain Plaza
    const plazaGeo = new THREE.CylinderGeometry(14, 14, 0.25, 48);
    const plazaMat = new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.5 });
    const plazaMesh = new THREE.Mesh(plazaGeo, plazaMat);
    plazaMesh.position.set(0, 0.1, 0);
    plazaMesh.receiveShadow = true;
    worldGroup.add(plazaMesh);

    // Fountain Pool
    const poolGeo = new THREE.CylinderGeometry(5.5, 5.5, 0.4, 32);
    const poolBorderMat = new THREE.MeshStandardMaterial({ color: '#64748b' });
    const poolMesh = new THREE.Mesh(poolGeo, poolBorderMat);
    poolMesh.position.set(0, 0.2, 0);
    worldGroup.add(poolMesh);

    const waterGeo = new THREE.CylinderGeometry(5.1, 5.1, 0.38, 32);
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.set(0, 0.25, 0);
    worldGroup.add(waterMesh);

    // Roads (Internal Loop & Connecting Avenues to AMap Arterials)
    const createRoad = (w: number, d: number, x: number, z: number, rY = 0) => {
      const rGeo = new THREE.BoxGeometry(w, 0.08, d);
      const rMesh = new THREE.Mesh(rGeo, roadMat);
      rMesh.position.set(x, 0.04, z);
      rMesh.rotation.y = rY;
      rMesh.receiveShadow = true;
      worldGroup.add(rMesh);

      // Zebra crossings & markings
      const markGeo = new THREE.BoxGeometry(w * 0.9, 0.09, 0.4);
      const markMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
      const markMesh = new THREE.Mesh(markGeo, markMat);
      markMesh.position.set(x, 0.05, z);
      markMesh.rotation.y = rY;
      worldGroup.add(markMesh);
    };

    // Internal loop
    createRoad(70, 7, 0, 24);
    createRoad(70, 7, 0, -22);
    createRoad(7, 60, -32, 0);
    createRoad(7, 60, 32, 0);

    // Connecting Avenues to Outer AMap Arterial Grid:
    // North Gate Connector -> 科技大道 (Z = -50)
    createRoad(12, 28, 0, -36);
    // South Gate Connector -> 创新大道 (Z = +55)
    createRoad(14, 31, 0, 39.5);
    // East Gate Connector -> 申江南路 (X = +65)
    createRoad(33, 12, 48.5, 0);
    // West Gate Connector -> 环园西路 (X = -60)
    createRoad(28, 12, -46, 0);

    // Surrounding 3D Urban Architecture (AMap 3D WebGL Building Massing)
    const surroundingBuildingsData: [number, number, number, number, number][] = [
      // Block 01: 集成电路产业设计基地 (North-West)
      [-78, -65, 20, 16, 16],
      [-95, -63, 16, 14, 12],
      [-75, -84, 18, 16, 20],
      [-94, -84, 16, 14, 14],
      [-64, -75, 12, 14, 10],

      // Block 02: 未来算力中心 (South-West)
      [-78, 68, 20, 16, 22],
      [-95, 70, 16, 16, 16],
      [-76, 88, 22, 16, 25],
      [-94, 88, 16, 14, 14],
      [-64, 78, 14, 12, 12],

      // Block 03: 生物医药创新试验港 (North-East)
      [78, -62, 18, 16, 18],
      [95, -63, 16, 14, 14],
      [76, -82, 20, 18, 24],
      [94, -82, 16, 14, 16],
      [64, -72, 14, 12, 11],

      // Block 04: 高端空天装备智造基地 (South-East)
      [78, 70, 20, 16, 20],
      [95, 72, 16, 16, 15],
      [76, 90, 22, 16, 26],
      [94, 90, 16, 14, 14],
      [64, 80, 12, 14, 12]
    ];

    surroundingBuildingsData.forEach(([bx, bz, bw, bd, bh]) => {
      const bMesh = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), surroundingBuildingMat);
      bMesh.position.set(bx, bh / 2, bz);
      bMesh.castShadow = true;
      bMesh.receiveShadow = true;
      surroundingGroup.add(bMesh);

      // Elegant architectural silhouette edge lines
      const edgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(bw, bh, bd));
      const edgeLine = new THREE.LineSegments(edgeGeo, surroundingEdgeMat);
      edgeLine.position.set(bx, bh / 2, bz);
      surroundingGroup.add(edgeLine);
    });

    // Outer Arterial Traffic (Moving vehicles along 科技大道 Z=-50 and 申江南路 X=65)
    const trafficVehicles: { mesh: THREE.Group; axis: 'x' | 'z'; speed: number; min: number; max: number }[] = [];
    const carMat1 = new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.3 });
    const carMat2 = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.3 });
    const carMat3 = new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.3 });
    const carMats = [carMat1, carMat2, carMat3];

    // Vehicles along 科技大道 (East-West at Z = -50)
    for (let i = 0; i < 4; i++) {
      const vGroup = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.1, 1.6), carMats[i % 3]);
      body.position.y = 0.6;
      vGroup.add(body);
      const startX = -120 + i * 65;
      vGroup.position.set(startX, 0.05, -50 + (i % 2 === 0 ? 2.2 : -2.2));
      if (i % 2 !== 0) vGroup.rotation.y = Math.PI;
      worldGroup.add(vGroup);
      trafficVehicles.push({
        mesh: vGroup,
        axis: 'x',
        speed: (i % 2 === 0 ? 1 : -1) * (18 + (i % 3) * 4),
        min: -160,
        max: 160
      });
    }

    // Vehicles along 申江南路 (North-South at X = 65)
    for (let i = 0; i < 4; i++) {
      const vGroup = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 3.2), carMats[(i + 1) % 3]);
      body.position.y = 0.6;
      vGroup.add(body);
      const startZ = -120 + i * 65;
      vGroup.position.set(65 + (i % 2 === 0 ? 2.2 : -2.2), 0.05, startZ);
      if (i % 2 !== 0) vGroup.rotation.y = Math.PI;
      worldGroup.add(vGroup);
      trafficVehicles.push({
        mesh: vGroup,
        axis: 'z',
        speed: (i % 2 === 0 ? 1 : -1) * (18 + (i % 3) * 4),
        min: -160,
        max: 160
      });
    }

    // Green garden patches & Trees
    const gardenGeo = new THREE.BoxGeometry(10, 0.2, 8);
    const g1 = new THREE.Mesh(gardenGeo, grassMat);
    g1.position.set(-15, 0.1, 4);
    g1.receiveShadow = true;
    worldGroup.add(g1);

    const g2 = new THREE.Mesh(gardenGeo, grassMat);
    g2.position.set(15, 0.1, 4);
    g2.receiveShadow = true;
    worldGroup.add(g2);

    // Procedural low-poly trees
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: '#78350f' });
    const treeFoliageMat = new THREE.MeshStandardMaterial({ color: '#22c55e', roughness: 0.8 });
    const treeFoliageMat2 = new THREE.MeshStandardMaterial({ color: '#16a34a', roughness: 0.8 });

    const createTree = (x: number, z: number, scale = 1) => {
      const group = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15 * scale, 0.25 * scale, 1.4 * scale, 8), treeTrunkMat);
      trunk.position.y = 0.7 * scale;
      trunk.castShadow = true;
      group.add(trunk);

      const f1 = new THREE.Mesh(new THREE.ConeGeometry(1.2 * scale, 2.2 * scale, 8), treeFoliageMat);
      f1.position.y = 2.2 * scale;
      f1.castShadow = true;
      group.add(f1);

      const f2 = new THREE.Mesh(new THREE.ConeGeometry(0.9 * scale, 1.8 * scale, 8), treeFoliageMat2);
      f2.position.y = 3.2 * scale;
      f2.castShadow = true;
      group.add(f2);

      group.position.set(x, 0, z);
      worldGroup.add(group);
    };

    [
      [-18, 2], [-14, 6], [-12, 1], [-16, 8],
      [18, 2], [14, 6], [12, 1], [16, 8],
      [-8, 12], [8, 12], [-8, -12], [8, -12],
      [-26, 15], [26, 15], [-26, -15], [26, -15]
    ].forEach(([tx, tz]) => createTree(tx, tz, 0.8 + Math.random() * 0.4));

    // Street Lamps with small glowing heads
    const lampMat = new THREE.MeshStandardMaterial({ color: '#475569' });
    const lampLightMat = new THREE.MeshBasicMaterial({ color: '#fef08a' });
    [
      [-10, 20], [10, 20], [-10, -18], [10, -18],
      [-28, 8], [28, 8], [-28, -8], [28, -8]
    ].forEach(([lx, lz]) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3.2, 8), lampMat);
      pole.position.set(lx, 1.6, lz);
      worldGroup.add(pole);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 0.4), lampLightMat);
      head.position.set(lx, 3.2, lz);
      worldGroup.add(head);
    });

    // Moving miniature electric shuttle on the perimeter road
    const shuttleGroup = new THREE.Group();
    const shuttleBody = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 3), new THREE.MeshStandardMaterial({ color: '#0284c7', metalness: 0.5 }));
    shuttleBody.position.y = 0.6;
    shuttleGroup.add(shuttleBody);
    const shuttleGlass = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.45, 2.2), new THREE.MeshStandardMaterial({ color: '#bae6fd', transparent: true, opacity: 0.8 }));
    shuttleGlass.position.y = 0.85;
    shuttleGroup.add(shuttleGlass);
    worldGroup.add(shuttleGroup);

    // 7. BUILDINGS ARCHITECTURE SETUP
    // We maintain references to building meshes for raycasting hover/clicks
    const interactiveBuildings: { id: string; mesh: THREE.Object3D; data: BuildingInfo }[] = [];

    // OTHER BUILDINGS (B5-B, B2-B, C3-A, A1-S)
    CAMPUS_BUILDINGS.filter(b => b.id !== 'b1-a').forEach(b => {
      const bGroup = new THREE.Group();
      bGroup.position.set(b.position[0], 0, b.position[2]);

      const [sx, sy, sz] = b.size;

      // Base Podium
      const podium = new THREE.Mesh(
        new THREE.BoxGeometry(sx * 1.1, 2.5, sz * 1.1),
        buildingWhiteMat
      );
      podium.position.y = 1.25;
      podium.castShadow = true;
      podium.receiveShadow = true;
      bGroup.add(podium);

      // Main Tower
      const tower = new THREE.Mesh(
        new THREE.BoxGeometry(sx, sy, sz),
        glassMat
      );
      tower.position.y = 2.5 + sy / 2;
      tower.castShadow = true;
      tower.receiveShadow = true;
      bGroup.add(tower);

      // Distinct architectural crown/facets for realism
      const crown = new THREE.Mesh(
        new THREE.BoxGeometry(sx * 0.95, 1.2, sz * 0.95),
        buildingWhiteMat
      );
      crown.position.y = 2.5 + sy + 0.6;
      bGroup.add(crown);

      // Glowing edges
      const edgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(sx, sy, sz));
      const edgeLine = new THREE.LineSegments(edgeGeo, glowEdgeMat);
      edgeLine.position.copy(tower.position);
      bGroup.add(edgeLine);

      // Top antenna / beacon
      const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3), new THREE.MeshBasicMaterial({ color: '#0ea5e9' }));
      antenna.position.set(0, 2.5 + sy + 2.5, 0);
      bGroup.add(antenna);

      // Add to interactive set
      interactiveBuildings.push({ id: b.id, mesh: bGroup, data: b });
      worldGroup.add(bGroup);
    });

    // 8. B1-A CORE BUILDING SETUP (Multi-slice floors for BIM Section Cut)
    const b1aGroup = new THREE.Group();
    b1aGroup.position.set(0, 0, 0);
    worldGroup.add(b1aGroup);

    // We store each floor slice group for B1-A
    interface B1AFloorSlice {
      floorNum: number;
      group: THREE.Group;
      originalY: number;
      currentY: number;
      roomsGroup: THREE.Group;
      edgeLines: THREE.LineSegments;
      outerWalls: THREE.Mesh[];
    }
    const floorSlices: B1AFloorSlice[] = [];
    const interactiveRooms: { id: string; mesh: THREE.Object3D; data: RoomData }[] = [];

    // Base podium of B1-A
    const b1aPodium = new THREE.Mesh(
      new THREE.BoxGeometry(16.5, 1.5, 20.5),
      buildingWhiteMat
    );
    b1aPodium.position.y = 0.75;
    b1aPodium.receiveShadow = true;
    b1aGroup.add(b1aPodium);

    const floorHeight = 2.1;
    const b1aWidth = 14;
    const b1aDepth = 18;

    // Build F1 through F7
    B1A_FLOORS.slice().reverse().forEach(floor => {
      const fNum = floor.floorNumber;
      const fGroup = new THREE.Group();
      const baseY = 1.5 + (fNum - 1) * floorHeight;
      fGroup.position.y = baseY;

      // Floor slab
      const slabGeo = new THREE.BoxGeometry(b1aWidth, 0.25, b1aDepth);
      const slabMat = new THREE.MeshStandardMaterial({
        color: '#f8fafc',
        roughness: 0.4,
        metalness: 0.1
      });
      const slabMesh = new THREE.Mesh(slabGeo, slabMat);
      slabMesh.position.y = 0.125;
      slabMesh.receiveShadow = true;
      fGroup.add(slabMesh);

      // Outer glass walls (4 sides)
      const outerWalls: THREE.Mesh[] = [];
      const wallMat = glassMat.clone();
      
      // North & South walls
      const nsGeo = new THREE.BoxGeometry(b1aWidth, floorHeight - 0.25, 0.2);
      const northWall = new THREE.Mesh(nsGeo, wallMat);
      northWall.position.set(0, floorHeight / 2, b1aDepth / 2);
      fGroup.add(northWall);
      outerWalls.push(northWall);

      const southWall = new THREE.Mesh(nsGeo, wallMat);
      southWall.position.set(0, floorHeight / 2, -b1aDepth / 2);
      fGroup.add(southWall);
      outerWalls.push(southWall);

      // East & West walls
      const ewGeo = new THREE.BoxGeometry(0.2, floorHeight - 0.25, b1aDepth);
      const eastWall = new THREE.Mesh(ewGeo, wallMat);
      eastWall.position.set(b1aWidth / 2, floorHeight / 2, 0);
      fGroup.add(eastWall);
      outerWalls.push(eastWall);

      const westWall = new THREE.Mesh(ewGeo, wallMat);
      westWall.position.set(-b1aWidth / 2, floorHeight / 2, 0);
      fGroup.add(westWall);
      outerWalls.push(westWall);

      // Floor Edge highlight outline
      const edgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(b1aWidth, floorHeight, b1aDepth));
      const edgeLine = new THREE.LineSegments(edgeGeo, glowEdgeMat.clone());
      edgeLine.position.y = floorHeight / 2;
      fGroup.add(edgeLine);

      // Central core elevators/stairs block
      const coreGeo = new THREE.BoxGeometry(2.4, floorHeight - 0.2, 3.2);
      const coreMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.6 });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.position.set(0, floorHeight / 2, 0);
      fGroup.add(coreMesh);

      // Rooms group inside the floor
      const roomsGroup = new THREE.Group();
      fGroup.add(roomsGroup);

      // If this is F5, build out detailed room partition layout!
      if (fNum === 5 && floor.rooms.length > 0) {
        floor.rooms.forEach(room => {
          const roomObj = new THREE.Group();
          const [rx, ry, rz] = room.position;
          const [rw, rh, rd] = room.size;

          roomObj.position.set(rx, 0.2, rz);

          // Floor mat for the room with distinctive tint
          const rFloorMat = new THREE.MeshStandardMaterial({
            color: room.color,
            roughness: 0.3,
            metalness: 0.1,
            transparent: true,
            opacity: 0.55
          });
          const rFloor = new THREE.Mesh(new THREE.BoxGeometry(rw, 0.06, rd), rFloorMat);
          rFloor.position.y = 0.03;
          rFloor.receiveShadow = true;
          roomObj.add(rFloor);

          // Room boundary walls (lower transparent glass partitions for BIM visibility)
          const rWallMat = new THREE.MeshStandardMaterial({
            color: '#38bdf8',
            transparent: true,
            opacity: 0.45,
            roughness: 0.2
          });
          const rEdges = new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(rw, 1.2, rd)),
            new THREE.LineBasicMaterial({ color: '#38bdf8' })
          );
          rEdges.position.y = 0.6;
          roomObj.add(rEdges);

          // 3D Desks / Furniture to make rooms feel realistic and vibrant
          const deskMat = new THREE.MeshStandardMaterial({ color: '#ffffff' });
          const chairMat = new THREE.MeshStandardMaterial({ color: '#0284c7' });

          if (room.category === '研发办公') {
            // Cluster of work stations
            for (let dx = -rw / 3; dx <= rw / 3; dx += rw / 2.5) {
              const desk = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 0.6), deskMat);
              desk.position.set(dx, 0.25, 0);
              roomObj.add(desk);

              const screen = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.05), new THREE.MeshBasicMaterial({ color: '#38bdf8' }));
              screen.position.set(dx, 0.6, 0);
              roomObj.add(screen);

              const chair = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), chairMat);
              chair.position.set(dx, 0.2, 0.5);
              roomObj.add(chair);
            }
          } else if (room.category === '会议中心') {
            // Large conference boardroom table
            const confTable = new THREE.Mesh(new THREE.BoxGeometry(rw * 0.6, 0.45, rd * 0.4), deskMat);
            confTable.position.set(0, 0.25, 0);
            roomObj.add(confTable);

            const displayWall = new THREE.Mesh(new THREE.BoxGeometry(rw * 0.7, 0.8, 0.05), new THREE.MeshBasicMaterial({ color: '#0284c7' }));
            displayWall.position.set(0, 0.8, -rd * 0.4);
            roomObj.add(displayWall);
          } else if (room.category === '前沿实验') {
            // Server racks with blue blinking LEDs
            for (let sx = -rw / 3; sx <= rw / 3; sx += rw / 3) {
              const rack = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 0.6), new THREE.MeshStandardMaterial({ color: '#1e293b' }));
              rack.position.set(sx, 0.55, 0);
              roomObj.add(rack);

              const led = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 0.02), new THREE.MeshBasicMaterial({ color: '#38bdf8' }));
              led.position.set(sx, 0.9, 0.31);
              roomObj.add(led);
            }
          } else if (room.category === '休闲配套') {
            // Circular bar tables & plants
            const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.5, 16), deskMat);
            bar.position.set(0, 0.25, 0);
            roomObj.add(bar);
          }

          // Hotspot interactive Click Pin on top of each room
          const pinGroup = new THREE.Group();
          pinGroup.position.set(0, 1.6, 0);

          // Glowing diamond / sphere pin
          const pinSphere = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.3, 0),
            new THREE.MeshBasicMaterial({ color: '#38bdf8' })
          );
          pinGroup.add(pinSphere);

          // Pulsing radar ring
          const ringGeo = new THREE.RingGeometry(0.35, 0.45, 24);
          const ringMesh = new THREE.Mesh(
            ringGeo,
            new THREE.MeshBasicMaterial({ color: '#38bdf8', side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
          );
          ringMesh.rotation.x = Math.PI / 2;
          pinGroup.add(ringMesh);

          roomObj.add(pinGroup);

          // Register room for interaction
          interactiveRooms.push({ id: room.id, mesh: roomObj, data: room });
          roomsGroup.add(roomObj);
        });
      }

      b1aGroup.add(fGroup);
      floorSlices.push({
        floorNum: fNum,
        group: fGroup,
        originalY: baseY,
        currentY: baseY,
        roomsGroup,
        edgeLines: edgeLine,
        outerWalls
      });
    });

    // B1-A Rooftop structures (on F7)
    const roofGroup = new THREE.Group();
    roofGroup.position.y = 1.5 + 7 * floorHeight;
    const roofCap = new THREE.Mesh(new THREE.BoxGeometry(b1aWidth * 0.9, 0.8, b1aDepth * 0.9), buildingWhiteMat);
    roofGroup.add(roofCap);

    const hvac = new THREE.Mesh(new THREE.BoxGeometry(3, 1.2, 4), new THREE.MeshStandardMaterial({ color: '#94a3b8' }));
    hvac.position.set(-2, 0.8, 0);
    roofGroup.add(hvac);

    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 6), new THREE.MeshBasicMaterial({ color: '#38bdf8' }));
    spire.position.set(2, 3.2, 2);
    roofGroup.add(spire);
    b1aGroup.add(roofGroup);

    // ROOFTOP SURVEILLANCE LAYER (高德坐标 E 121°36'28" · N 31°12'09" 楼层上方监控图层)
    const cctvLayerGroup = new THREE.Group();
    cctvLayerGroup.visible = showRooftopSurveillance;
    themeObjectsRef.current.cctvLayerGroup = cctvLayerGroup;
    b1aGroup.add(cctvLayerGroup);

    interface InteractiveCCTV {
      id: string;
      mesh: THREE.Object3D;
      data: RooftopCameraNode;
      radarScan?: THREE.Mesh;
      coneScan?: THREE.Mesh;
    }
    const interactiveCCTVs: InteractiveCCTV[] = [];

    // Positions on the rooftop: Center Mast, North Edge, East Edge
    const cctvConfigs = [
      {
        camData: ROOFTOP_CAMERAS[0], // 360° 鹰眼
        pos: [0, 1.5 + 7 * floorHeight + 4.2, 0] as [number, number, number],
        coneRot: [Math.PI / 4, 0, 0] as [number, number, number],
        scanRadius: 5.5,
        color: '#06b6d4'
      },
      {
        camData: ROOFTOP_CAMERAS[1], // 北向夜视
        pos: [0, 1.5 + 7 * floorHeight + 2.2, 7.5] as [number, number, number],
        coneRot: [Math.PI / 3, 0, 0] as [number, number, number],
        scanRadius: 4.5,
        color: '#0ea5e9'
      },
      {
        camData: ROOFTOP_CAMERAS[2], // 东向热成像
        pos: [5.8, 1.5 + 7 * floorHeight + 2.4, 0] as [number, number, number],
        coneRot: [0, 0, -Math.PI / 3] as [number, number, number],
        scanRadius: 4.8,
        color: '#10b981'
      }
    ];

    cctvConfigs.forEach(cfg => {
      const cctvNode = new THREE.Group();
      cctvNode.position.set(...cfg.pos);

      // Mount pole/bracket
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8),
        new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.8, roughness: 0.2 })
      );
      pole.position.y = -0.6;
      cctvNode.add(pole);

      // Camera Dome / Bullet Body
      const domeGeo = new THREE.SphereGeometry(0.35, 16, 16);
      const domeMat = new THREE.MeshStandardMaterial({
        color: '#ffffff',
        metalness: 0.5,
        roughness: 0.2
      });
      const dome = new THREE.Mesh(domeGeo, domeMat);
      cctvNode.add(dome);

      // Lens optic glass
      const lensGeo = new THREE.CylinderGeometry(0.18, 0.2, 0.25, 16);
      const lensMat = new THREE.MeshStandardMaterial({
        color: '#0284c7',
        metalness: 0.9,
        roughness: 0.1
      });
      const lens = new THREE.Mesh(lensGeo, lensMat);
      lens.rotation.x = Math.PI / 2;
      lens.position.z = 0.25;
      cctvNode.add(lens);

      // Indicator LED (blinking online pulse)
      const led = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        new THREE.MeshBasicMaterial({ color: '#22c55e' })
      );
      led.position.set(0.2, 0.2, 0.2);
      cctvNode.add(led);

      // Holographic FOV Surveillance Cone (Projected visual ray frustum)
      const coneGeo = new THREE.ConeGeometry(cfg.scanRadius, 7.5, 24, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(0, -3.75, 0);
      cone.rotation.set(...cfg.coneRot);
      cctvNode.add(cone);

      // Scanning radar floor circle ring
      const scanRingGeo = new THREE.RingGeometry(0.3, cfg.scanRadius, 24);
      const scanRingMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.45,
        depthWrite: false
      });
      const ringMesh = new THREE.Mesh(scanRingGeo, scanRingMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = -6.5;
      cctvNode.add(ringMesh);

      // Floating Marker Pin Above Camera
      const pinCanvas = document.createElement('canvas');
      pinCanvas.width = 256;
      pinCanvas.height = 84;
      const pctx = pinCanvas.getContext('2d')!;
      pctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      pctx.roundRect(4, 4, 248, 76, 16);
      pctx.fill();
      pctx.lineWidth = 3;
      pctx.strokeStyle = cfg.color;
      pctx.stroke();

      pctx.fillStyle = '#38bdf8';
      pctx.font = 'bold 22px system-ui, sans-serif';
      pctx.fillText(`● 监控图层 | ${cfg.camData.buildingCode}`, 16, 34);

      pctx.fillStyle = '#94a3b8';
      pctx.font = '16px monospace';
      pctx.fillText(`高德 E121°36' N31°12' 楼顶`, 16, 62);

      const pinTex = new THREE.CanvasTexture(pinCanvas);
      const pinSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: pinTex, transparent: true }));
      pinSprite.scale.set(3.6, 1.2, 1);
      pinSprite.position.set(0, 1.3, 0);
      cctvNode.add(pinSprite);

      cctvLayerGroup.add(cctvNode);
      interactiveCCTVs.push({
        id: cfg.camData.id,
        mesh: cctvNode,
        data: cfg.camData,
        coneScan: cone,
        radarScan: ringMesh
      });
    });

    // Register B1-A as interactive in overview
    interactiveBuildings.push({
      id: 'b1-a',
      mesh: b1aGroup,
      data: CAMPUS_BUILDINGS.find(b => b.id === 'b1-a')!
    });

    // 9. HIGH-TECH ROBOT PATROL SETUP (巡检机器人 "Titan-07")
    const robotGroup = new THREE.Group();
    robotGroup.position.set(0, 0.4, 8);
    worldGroup.add(robotGroup);

    // Robot Chassis (Futuristic patrol vehicle)
    const chassisMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', metalness: 0.7, roughness: 0.25 });
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 1.6), chassisMat);
    chassis.position.y = 0.35;
    chassis.castShadow = true;
    robotGroup.add(chassis);

    // Front sensor visor with glowing blue line
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.2, 0.1), new THREE.MeshBasicMaterial({ color: '#38bdf8' }));
    visor.position.set(0, 0.4, 0.81);
    robotGroup.add(visor);

    // Wheels / Tracks (4 high-traction rubber wheels)
    const wheelMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.9 });
    const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.25, 16);
    const wheels = [
      [-0.68, 0.28, 0.55],
      [0.68, 0.28, 0.55],
      [-0.68, 0.28, -0.55],
      [0.68, 0.28, -0.55]
    ].map(([wx, wy, wz]) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wx, wy, wz);
      robotGroup.add(w);
      return w;
    });

    // Rotating LiDAR Dome on top
    const lidarMast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.3, 16), new THREE.MeshStandardMaterial({ color: '#334155' }));
    lidarMast.position.set(0, 0.75, -0.2);
    robotGroup.add(lidarMast);

    const lidarHead = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.2, 16), new THREE.MeshBasicMaterial({ color: '#0ea5e9' }));
    lidarHead.position.set(0, 0.95, -0.2);
    robotGroup.add(lidarHead);

    // Ground Laser Radar Fan Beam (Scanning wave on floor)
    const scanRingGeo = new THREE.RingGeometry(0.8, 3.2, 32);
    const scanRingMat = new THREE.MeshBasicMaterial({
      color: '#38bdf8',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45
    });
    const scanRing = new THREE.Mesh(scanRingGeo, scanRingMat);
    scanRing.rotation.x = -Math.PI / 2;
    scanRing.position.y = 0.05;
    robotGroup.add(scanRing);

    // Forward Spotlamp cone
    const spotLamp = new THREE.SpotLight('#bae6fd', 3, 18, Math.PI / 6, 0.3);
    spotLamp.position.set(0, 0.6, 0.8);
    spotLamp.target.position.set(0, 0, 10);
    robotGroup.add(spotLamp);
    robotGroup.add(spotLamp.target);

    // 10. MOUSE & RAYCASTING INTERACTION
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e: MouseEvent) => {
      if (e.button === 0 || e.button === 2) {
        stateRef.current.isDragging = true;
        stateRef.current.prevMousePos = { x: e.clientX, y: e.clientY };
      }
    };

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Handle Camera Orbit or Pan if dragging
      if (stateRef.current.isDragging) {
        const dx = e.clientX - stateRef.current.prevMousePos.x;
        const dy = e.clientY - stateRef.current.prevMousePos.y;
        stateRef.current.prevMousePos = { x: e.clientX, y: e.clientY };

        if (e.buttons === 1) {
          // Left click: Orbit
          stateRef.current.orbitAngles.theta -= dx * 0.006;
          stateRef.current.orbitAngles.phi = Math.max(
            0.15,
            Math.min(Math.PI / 2 - 0.05, stateRef.current.orbitAngles.phi + dy * 0.006)
          );
        } else if (e.buttons === 2) {
          // Right click: Pan
          stateRef.current.panOffset.x -= dx * 0.05;
          stateRef.current.panOffset.z += dy * 0.05;
        }
        return;
      }

      // Check hover when not dragging
      raycaster.setFromCamera(mouse, camera);

      if (stateRef.current.viewLevel === 'overview') {
        // First check hover on rooftop surveillance cameras if layer is enabled
        if (showRooftopSurveillance) {
          const cctvIntersects = raycaster.intersectObjects(
            interactiveCCTVs.map(c => c.mesh),
            true
          );
          if (cctvIntersects.length > 0) {
            const hit = cctvIntersects[0].object;
            const camFound = interactiveCCTVs.find(c => {
              let curr: THREE.Object3D | null = hit;
              while (curr) {
                if (curr === c.mesh) return true;
                curr = curr.parent;
              }
              return false;
            });
            if (camFound) {
              container.style.cursor = 'pointer';
              stateRef.current.onHoverObject({
                name: `${camFound.data.name}`,
                type: `高德坐标: E 121°36'28" · N 31°12'09" (${camFound.data.floorLevel})`,
                x: e.clientX,
                y: e.clientY
              });
              return;
            }
          }
        }

        const intersects = raycaster.intersectObjects(
          interactiveBuildings.map(b => b.mesh),
          true
        );
        if (intersects.length > 0) {
          const hitMesh = intersects[0].object;
          const found = interactiveBuildings.find(b => {
            let curr: THREE.Object3D | null = hitMesh;
            while (curr) {
              if (curr === b.mesh) return true;
              curr = curr.parent;
            }
            return false;
          });
          if (found) {
            container.style.cursor = 'pointer';
            stateRef.current.onHoverObject({
              name: `${found.data.code} ${found.data.name}`,
              type: found.data.type,
              x: e.clientX,
              y: e.clientY
            });
            return;
          }
        }
      } else if (stateRef.current.viewLevel === 'building') {
        // Hover single floor in building view
        const floorIntersects = raycaster.intersectObjects(
          floorSlices.map(fs => fs.group),
          true
        );
        if (floorIntersects.length > 0) {
          const hit = floorIntersects[0].object;
          const found = floorSlices.find(fs => {
            let curr: THREE.Object3D | null = hit;
            while (curr) {
              if (curr === fs.group) return true;
              curr = curr.parent;
            }
            return false;
          });
          if (found) {
            container.style.cursor = 'pointer';
            const fInfo = B1A_FLOORS.find(f => f.floorNumber === found.floorNum);
            stateRef.current.onHoverObject({
              name: `F${found.floorNum} 楼层 · ${fInfo ? fInfo.label : ''}`,
              type: `${fInfo ? fInfo.purpose : '标准商务研发层'} (点击进入单层剖切)`,
              x: e.clientX,
              y: e.clientY
            });
            return;
          }
        }
      } else if (stateRef.current.viewLevel === 'floor') {
        // Hover room pins in floor cut view
        const roomIntersects = raycaster.intersectObjects(
          interactiveRooms.map(r => r.mesh),
          true
        );
        if (roomIntersects.length > 0) {
          const hit = roomIntersects[0].object;
          const rFound = interactiveRooms.find(r => {
            let curr: THREE.Object3D | null = hit;
            while (curr) {
              if (curr === r.mesh) return true;
              curr = curr.parent;
            }
            return false;
          });
          if (rFound) {
            container.style.cursor = 'pointer';
            stateRef.current.onHoverObject({
              name: `${rFound.data.roomNumber} ${rFound.data.enterpriseName}`,
              type: `${rFound.data.category} | ${rFound.data.usableArea}㎡`,
              x: e.clientX,
              y: e.clientY
            });
            return;
          }
        }
      }

      container.style.cursor = 'default';
      stateRef.current.onHoverObject(null);
    };

    const handlePointerUp = () => {
      stateRef.current.isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      stateRef.current.orbitAngles.radius = Math.max(
        8,
        Math.min(130, stateRef.current.orbitAngles.radius + e.deltaY * 0.05)
      );
    };

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      if (stateRef.current.viewLevel === 'overview') {
        // Check click on rooftop surveillance cameras if layer enabled
        if (showRooftopSurveillance) {
          const cctvIntersects = raycaster.intersectObjects(
            interactiveCCTVs.map(c => c.mesh),
            true
          );
          if (cctvIntersects.length > 0) {
            const hit = cctvIntersects[0].object;
            const camFound = interactiveCCTVs.find(c => {
              let curr: THREE.Object3D | null = hit;
              while (curr) {
                if (curr === c.mesh) return true;
                curr = curr.parent;
              }
              return false;
            });
            if (camFound && onSelectRooftopCamera) {
              onSelectRooftopCamera(camFound.data);
              return;
            }
          }
        }

        const intersects = raycaster.intersectObjects(
          interactiveBuildings.map(b => b.mesh),
          true
        );
        if (intersects.length > 0) {
          const hit = intersects[0].object;
          const found = interactiveBuildings.find(b => {
            let curr: THREE.Object3D | null = hit;
            while (curr) {
              if (curr === b.mesh) return true;
              curr = curr.parent;
            }
            return false;
          });
          if (found) {
            stateRef.current.onSelectBuilding(found.data);
          }
        }
      } else if (stateRef.current.viewLevel === 'building') {
        const floorIntersects = raycaster.intersectObjects(
          floorSlices.map(fs => fs.group),
          true
        );
        if (floorIntersects.length > 0) {
          const hit = floorIntersects[0].object;
          const found = floorSlices.find(fs => {
            let curr: THREE.Object3D | null = hit;
            while (curr) {
              if (curr === fs.group) return true;
              curr = curr.parent;
            }
            return false;
          });
          if (found) {
            stateRef.current.onSelectFloor(found.floorNum);
          }
        }
      } else if (stateRef.current.viewLevel === 'floor') {
        const roomIntersects = raycaster.intersectObjects(
          interactiveRooms.map(r => r.mesh),
          true
        );
        if (roomIntersects.length > 0) {
          const hit = roomIntersects[0].object;
          const rFound = interactiveRooms.find(r => {
            let curr: THREE.Object3D | null = hit;
            while (curr) {
              if (curr === r.mesh) return true;
              curr = curr.parent;
            }
            return false;
          });
          if (rFound) {
            stateRef.current.onSelectRoom(rFound.data);
          }
        }
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    container.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('click', handleClick);
    container.addEventListener('contextmenu', handleContextMenu);

    // 11. ANIMATION LOOP & TRANSITIONS
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let scanScale = 1;
    let shuttleAngle = 0;
    const skyEffects = new CampusSky(scene, renderer, hemiLight, dirLight, rimLight);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Shuttle movement along perimeter
      shuttleAngle += delta * 0.25;
      shuttleGroup.position.set(
        Math.cos(shuttleAngle) * 32,
        0.05,
        Math.sin(shuttleAngle) * 23
      );
      shuttleGroup.rotation.y = -shuttleAngle - Math.PI / 2;

      // Outer Arterial Traffic movements along 科技大道 & 申江南路
      trafficVehicles.forEach(v => {
        if (v.axis === 'x') {
          v.mesh.position.x += delta * v.speed;
          if (v.mesh.position.x > v.max) v.mesh.position.x = v.min;
          if (v.mesh.position.x < v.min) v.mesh.position.x = v.max;
        } else {
          v.mesh.position.z += delta * v.speed;
          if (v.mesh.position.z > v.max) v.mesh.position.z = v.min;
          if (v.mesh.position.z < v.min) v.mesh.position.z = v.max;
        }
      });

      // Water ripple oscillation
      waterMesh.position.y = 0.25 + Math.sin(elapsed * 2.5) * 0.02;

      // Rooftop CCTV camera surveillance sweeping & radar scan wave
      if (cctvLayerGroup.visible) {
        interactiveCCTVs.forEach((cam, cIdx) => {
          if (cam.coneScan) {
            cam.coneScan.rotation.y = Math.sin(elapsed * 1.8 + cIdx * 1.5) * 0.4;
          }
          if (cam.radarScan) {
            const cPulse = 0.7 + Math.sin(elapsed * 3 + cIdx) * 0.3;
            (cam.radarScan.material as THREE.MeshBasicMaterial).opacity = 0.2 + cPulse * 0.35;
          }
        });
      }

      // Lidar scanner rotation & scan ring wave
      lidarHead.rotation.y += delta * 12;
      scanScale = 1 + (elapsed * 1.5) % 2.5;
      scanRing.scale.set(scanScale, scanScale, 1);
      (scanRing.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.6 - (scanScale - 1) / 2.5);

      // Room click pins bobbing
      interactiveRooms.forEach((r, idx) => {
        const pin = r.mesh.children[r.mesh.children.length - 1];
        if (pin) {
          pin.position.y = 1.6 + Math.sin(elapsed * 3 + idx) * 0.15;
          pin.rotation.y += delta * 2;
        }
      });

      // ROBOT PATROL LOGIC (Autonomous movement along waypoints)
      if (stateRef.current.isPatrolling || stateRef.current.viewLevel === 'roam') {
        const waypoints = PATROL_WAYPOINTS;
        const curWp = waypoints[stateRef.current.robotWaypointIndex];
        const nextIdx = (stateRef.current.robotWaypointIndex + 1) % waypoints.length;
        const nextWp = waypoints[nextIdx];

        stateRef.current.robotT += delta * 0.18; // Speed factor
        if (stateRef.current.robotT >= 1) {
          stateRef.current.robotT = 0;
          stateRef.current.robotWaypointIndex = nextIdx;
        }

        const p1 = new THREE.Vector3(...curWp.pos);
        const p2 = new THREE.Vector3(...nextWp.pos);
        const currentRobotPos = new THREE.Vector3().lerpVectors(p1, p2, stateRef.current.robotT);
        robotGroup.position.copy(currentRobotPos);
        stateRef.current.robotPos.copy(currentRobotPos);

        // Turn robot toward direction
        const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
        const targetRot = Math.atan2(dir.x, dir.z);
        robotGroup.rotation.y = THREE.MathUtils.lerp(robotGroup.rotation.y, targetRot, 0.08);
        stateRef.current.robotRot = robotGroup.rotation.y;

        // Roll wheels
        wheels.forEach(w => {
          w.rotation.x += delta * 6;
        });

        // Update telemetry status (heading, speed, waypoint)
        const headingDeg = Math.round(((targetRot * 180) / Math.PI + 360) % 360);
        stateRef.current.onUpdateRobotStatus({
          heading: headingDeg,
          speed: Number((4.5 + Math.sin(elapsed * 2) * 0.4).toFixed(2)),
          currentWaypoint: nextWp.name
        });
      }

      // BIM FLOOR SECTION CUT ANIMATIONS (Smooth slice transition)
      const targetFloor = stateRef.current.selectedFloor;
      const isFloorMode = stateRef.current.viewLevel === 'floor' || stateRef.current.viewLevel === 'room';

      floorSlices.forEach(slice => {
        if (isFloorMode) {
          if (slice.floorNum > targetFloor) {
            // Upper floors lift upwards and fade out
            const liftDistance = (slice.floorNum - targetFloor) * 6 + 4;
            slice.currentY = THREE.MathUtils.lerp(slice.currentY, slice.originalY + liftDistance, 0.06);
            slice.group.position.y = slice.currentY;
            slice.group.visible = slice.currentY < slice.originalY + 25; // Hide when high enough

            slice.outerWalls.forEach(w => {
              (w.material as THREE.MeshStandardMaterial).opacity = THREE.MathUtils.lerp(
                (w.material as THREE.MeshStandardMaterial).opacity,
                0.05,
                0.1
              );
            });
          } else if (slice.floorNum === targetFloor) {
            // Selected Floor: Anchor at proper height, blueprint highlight!
            slice.currentY = THREE.MathUtils.lerp(slice.currentY, slice.originalY, 0.08);
            slice.group.position.y = slice.currentY;
            slice.group.visible = true;

            // Make current floor glow brightly!
            slice.edgeLines.material = activeGlowEdgeMat;
            slice.outerWalls.forEach(w => {
              (w.material as THREE.MeshStandardMaterial).opacity = THREE.MathUtils.lerp(
                (w.material as THREE.MeshStandardMaterial).opacity,
                0.15,
                0.1
              );
            });
          } else {
            // Lower floors: Semi-transparent ghost structure
            slice.currentY = THREE.MathUtils.lerp(slice.currentY, slice.originalY, 0.08);
            slice.group.position.y = slice.currentY;
            slice.group.visible = true;
            slice.edgeLines.material = glowEdgeMat;
            slice.outerWalls.forEach(w => {
              (w.material as THREE.MeshStandardMaterial).opacity = THREE.MathUtils.lerp(
                (w.material as THREE.MeshStandardMaterial).opacity,
                0.35,
                0.1
              );
            });
          }
        } else {
          // Not in floor mode: return all floors to default building assembly
          slice.currentY = THREE.MathUtils.lerp(slice.currentY, slice.originalY, 0.08);
          slice.group.position.y = slice.currentY;
          slice.group.visible = true;
          slice.edgeLines.material = glowEdgeMat;
          slice.outerWalls.forEach(w => {
            (w.material as THREE.MeshStandardMaterial).opacity = THREE.MathUtils.lerp(
              (w.material as THREE.MeshStandardMaterial).opacity,
              0.65,
              0.08
            );
          });
        }
      });

      // Roof cap visibility
      roofGroup.visible = !isFloorMode || targetFloor >= 7;

      // CAMERA CONTROLLER & TARGET DESTINATIONS BASED ON VIEW LEVEL
      let targetPos = new THREE.Vector3();
      let lookTarget = new THREE.Vector3();

      if (stateRef.current.viewLevel === 'overview') {
        // Auto-rotation in overview if enabled
        if (stateRef.current.isAutoRotating && !stateRef.current.isDragging) {
          stateRef.current.orbitAngles.theta += delta * 0.12;
        }
        const { theta, phi, radius } = stateRef.current.orbitAngles;
        targetPos.set(
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.cos(theta)
        ).add(stateRef.current.panOffset);
        lookTarget.set(0, 4, 0).add(stateRef.current.panOffset);

      } else if (stateRef.current.viewLevel === 'building') {
        // Focused on B1-A
        if (stateRef.current.isAutoRotating && !stateRef.current.isDragging) {
          stateRef.current.currentRotAngle += delta * 0.2;
        }
        const r = 32;
        const h = 18;
        targetPos.set(
          Math.sin(stateRef.current.currentRotAngle) * r,
          h,
          Math.cos(stateRef.current.currentRotAngle) * r
        );
        lookTarget.set(0, 8, 0);

      } else if (stateRef.current.viewLevel === 'floor') {
        // Top-angled view of the dissected floor F5
        const fHeight = 1.5 + (stateRef.current.selectedFloor - 1) * floorHeight;
        targetPos.set(16, fHeight + 14, 18);
        lookTarget.set(0, fHeight + 1.2, 0);

      } else if (stateRef.current.viewLevel === 'room') {
        // Zoom close into selected room
        const selRoom = B1A_FLOORS[2]?.rooms.find(r => r.id === stateRef.current.selectedRoomId);
        const fHeight = 1.5 + 4 * floorHeight;
        if (selRoom) {
          const [rx, ry, rz] = selRoom.position;
          targetPos.set(rx + 4.5, fHeight + 3.8, rz + 4.5);
          lookTarget.set(rx, fHeight + 0.8, rz);
        } else {
          targetPos.set(6, fHeight + 5, 6);
          lookTarget.set(-2, fHeight + 0.5, -2);
        }

      } else if (stateRef.current.viewLevel === 'roam') {
        // Robot Roam Walkthrough Perspective
        const rPos = stateRef.current.robotPos;
        const rAngle = stateRef.current.robotRot;

        if (stateRef.current.roamPerspective === 'fpv') {
          // First-Person Walkthrough (FPV)
          targetPos.set(
            rPos.x + Math.sin(rAngle) * 0.4,
            rPos.y + 0.9,
            rPos.z + Math.cos(rAngle) * 0.4
          );
          lookTarget.set(
            rPos.x + Math.sin(rAngle) * 12,
            rPos.y + 0.9,
            rPos.z + Math.cos(rAngle) * 12
          );
        } else {
          // Third-Person Follow (TPV)
          const followDist = 5.5;
          const followHeight = 3.2;
          targetPos.set(
            rPos.x - Math.sin(rAngle) * followDist,
            rPos.y + followHeight,
            rPos.z - Math.cos(rAngle) * followDist
          );
          lookTarget.set(rPos.x, rPos.y + 1.2, rPos.z);
        }
      }

      // Smooth camera interpolation
      camera.position.lerp(targetPos, 0.05);
      stateRef.current.camTarget.lerp(lookTarget, 0.06);
      camera.lookAt(stateRef.current.camTarget);

      const outdoor = stateRef.current.viewLevel === 'overview' || stateRef.current.viewLevel === 'roam';
      skyEffects.update(skyState.current.sky, delta, skyState.current.themeMode === 'dark', outdoor);
      container.dataset.skyEnabled = String(skyState.current.sky.enabled && outdoor);
      container.dataset.skyTime = formatSkyTime(skyState.current.sky.minutes);

      renderer.render(scene, camera);
    };

    animate();

    // 12. WINDOW RESIZE
    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // CLEANUP
    return () => {
      cancelAnimationFrame(animationFrameId);
      skyEffects.dispose();
      resizeObserver.disconnect();
      container.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('click', handleClick);
      container.removeEventListener('contextmenu', handleContextMenu);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="digital-twin-3d-canvas"
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing outline-none"
    />
  );
};
