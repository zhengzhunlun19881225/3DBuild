/**
 * AMap (高德地图) Light Theme & GIS Texture Generator
 * Generates an authentic, high-resolution vector map texture matching AMap's "whitesmoke" (远山黛) style.
 * Calibrated precisely to the 3D scene coordinate space (Ground 500x500 units, Campus center at 0,0).
 * Features clean road hierarchy, ecological water bodies, park greenery, surrounding tech parcels,
 * and clean geographic labels without noisy commercial public POIs.
 */

import * as THREE from 'three';

export interface AMapGeneratorOptions {
  themeMode: 'light' | 'dark';
  showLabels?: boolean;
  resolution?: number; // 2048 default for ultra-crisp rendering
}

export function generateAMapTexture(options: AMapGeneratorOptions): THREE.CanvasTexture {
  const { themeMode, showLabels = true, resolution = 2048 } = options;
  const isDark = themeMode === 'dark';

  const canvas = document.createElement('canvas');
  canvas.width = resolution;
  canvas.height = resolution;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Unable to create 2D canvas context for AMap texture');
  }

  const S = resolution / 1024; // scale multiplier

  // 1. PALETTE DEFINITION (AMap Whitesmoke vs AMap Midnight)
  const colors = isDark
    ? {
        bg: '#070c18',
        blockBg: '#0f172a',
        blockBorder: '#1e293b',
        arterialBorder: '#1e293b',
        arterialFill: '#111827',
        laneLine: '#334155',
        highwayFill: '#1e293b',
        highwayBorder: '#334155',
        secondaryFill: '#0b1120',
        secondaryBorder: '#1e293b',
        water: '#0369a1',
        waterBorder: '#0284c7',
        waterRipple: '#0284c7',
        greenery: '#064e3b',
        greeneryBorder: '#065f46',
        parkPath: '#022c22',
        campusBorder: '#38bdf8',
        campusBg: '#0a192f',
        textRoad: '#94a3b8',
        textDistrict: '#64748b',
        textWater: '#38bdf8',
        textGreen: '#34d399',
        textHalo: '#020617',
        gridLine: 'rgba(56, 189, 248, 0.05)',
        pinColor: '#0284c7'
      }
    : {
        bg: '#f6f8fa', // AMap whitesmoke (远山黛) terrain base
        blockBg: '#eef2f6', // Urban parcel fill
        blockBorder: '#e2e8f0',
        arterialBorder: '#cbd5e1',
        arterialFill: '#ffffff', // Clean white road with subtle border
        laneLine: '#e2e8f0',
        highwayFill: '#ffffff',
        highwayBorder: '#94a3b8',
        secondaryFill: '#f8fafc',
        secondaryBorder: '#e2e8f0',
        water: '#cbe5f6', // Soft serene AMap water blue
        waterBorder: '#a5ceec',
        waterRipple: '#d8ecfa',
        greenery: '#e1f3e5', // Soft park mint green
        greeneryBorder: '#c4e7c9',
        parkPath: '#eff9f1',
        campusBorder: '#0284c7',
        campusBg: '#f8fafc',
        textRoad: '#475569',
        textDistrict: '#64748b',
        textWater: '#0284c7',
        textGreen: '#16a34a',
        textHalo: '#ffffff',
        gridLine: 'rgba(148, 163, 184, 0.12)',
        pinColor: '#0284c7'
      };

  // Helper function for text with halo (AMap style crisp readability)
  const drawHaloText = (
    text: string,
    x: number,
    y: number,
    color: string,
    fontSize: number,
    fontWeight = '600',
    align: CanvasTextAlign = 'center'
  ) => {
    if (!showLabels) return;
    ctx.save();
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.font = `${fontWeight} ${fontSize * S}px "PingFang SC", "Microsoft YaHei", sans-serif`;
    ctx.strokeStyle = colors.textHalo;
    ctx.lineWidth = 3.5 * S;
    ctx.lineJoin = 'round';
    ctx.strokeText(text, x * S, y * S);
    ctx.fillStyle = color;
    ctx.fillText(text, x * S, y * S);
    ctx.restore();
  };

  // 2. BASELINE TERRAIN
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, resolution, resolution);

  // Subtle GIS coordinate grid (200m interval)
  ctx.strokeStyle = colors.gridLine;
  ctx.lineWidth = 1 * S;
  const gridStep = 100 * S;
  ctx.beginPath();
  for (let x = 0; x <= resolution; x += gridStep) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, resolution);
  }
  for (let y = 0; y <= resolution; y += gridStep) {
    ctx.moveTo(0, y);
    ctx.lineTo(resolution, y);
  }
  ctx.stroke();

  // 3. WATER BODIES (张家浜生态景观河 - Curving across the North)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, 180 * S);
  ctx.bezierCurveTo(240 * S, 150 * S, 400 * S, 210 * S, 640 * S, 170 * S);
  ctx.bezierCurveTo(800 * S, 140 * S, 920 * S, 90 * S, 1024 * S, 70 * S);
  ctx.lineTo(1024 * S, 0);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fillStyle = colors.water;
  ctx.fill();
  ctx.strokeStyle = colors.waterBorder;
  ctx.lineWidth = 2 * S;
  ctx.stroke();

  // Gentle river ripples
  ctx.strokeStyle = colors.waterRipple;
  ctx.lineWidth = 1.5 * S;
  [
    [100, 100, 200, 90],
    [280, 130, 390, 140],
    [520, 120, 620, 110],
    [760, 90, 850, 70]
  ].forEach(([rx1, ry1, rx2, ry2]) => {
    ctx.beginPath();
    ctx.moveTo(rx1 * S, ry1 * S);
    ctx.lineTo(rx2 * S, ry2 * S);
    ctx.stroke();
  });
  ctx.restore();

  // River label
  drawHaloText('张 家 浜 生 态 景 观 河', 480, 120, colors.textWater, 13, '600');

  // 4. GREENERY & PARKS (张江科学城绿廊)
  const drawPark = (points: [number, number][], name?: string, labelPos?: [number, number]) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0][0] * S, points[0][1] * S);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0] * S, points[i][1] * S);
    }
    ctx.closePath();
    ctx.fillStyle = colors.greenery;
    ctx.fill();
    ctx.strokeStyle = colors.greeneryBorder;
    ctx.lineWidth = 1.5 * S;
    ctx.stroke();
    ctx.restore();

    if (name && labelPos) {
      drawHaloText(name, labelPos[0], labelPos[1], colors.textGreen, 11, '600');
    }
  };

  // Northwest wetland park
  drawPark(
    [
      [40, 220],
      [220, 220],
      [260, 360],
      [60, 380],
      [20, 300]
    ],
    '张江生态湿地绿地',
    [140, 300]
  );

  // Northeast riverfront green belt
  drawPark(
    [
      [720, 180],
      [960, 120],
      [990, 260],
      [800, 300],
      [710, 240]
    ],
    '滨河生态绿廊',
    [850, 210]
  );

  // South leisure garden
  drawPark(
    [
      [280, 780],
      [460, 780],
      [480, 920],
      [260, 920]
    ],
    '数智运动休闲绿洲',
    [370, 850]
  );

  // 5. SURROUNDING INDUSTRIAL & TECH PARCELS (规划地块轮廓)
  const drawParcel = (
    points: [number, number][],
    name: string,
    labelPos: [number, number],
    code: string
  ) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0][0] * S, points[0][1] * S);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0] * S, points[i][1] * S);
    }
    ctx.closePath();
    ctx.fillStyle = colors.blockBg;
    ctx.fill();
    ctx.strokeStyle = colors.blockBorder;
    ctx.lineWidth = 1.5 * S;
    ctx.stroke();
    ctx.restore();

    drawHaloText(name, labelPos[0], labelPos[1], colors.textDistrict, 11, '600');
    drawHaloText(code, labelPos[0], labelPos[1] + 15, colors.textDistrict, 8, '400');
  };

  // High-tech clusters around the campus
  drawParcel(
    [
      [80, 420],
      [260, 420],
      [260, 600],
      [80, 600]
    ],
    '集成电路研发设计基地',
    [170, 500],
    'BLOCK 01 · IC DESIGN'
  );

  drawParcel(
    [
      [80, 680],
      [260, 680],
      [260, 880],
      [80, 880]
    ],
    '未来算力与大模型中心',
    [170, 770],
    'BLOCK 02 · AI COMPUTING'
  );

  drawParcel(
    [
      [760, 360],
      [960, 360],
      [960, 580],
      [760, 580]
    ],
    '生物医药创新试验港',
    [860, 460],
    'BLOCK 03 · BIOMED'
  );

  drawParcel(
    [
      [760, 680],
      [960, 680],
      [960, 880],
      [760, 880]
    ],
    '高端空天装备智造基地',
    [860, 770],
    'BLOCK 04 · AEROSPACE'
  );

  // 6. ROAD NETWORK (城市主干道与次干道)
  interface RoadDef {
    type: 'arterial' | 'secondary' | 'connector';
    start: [number, number];
    end: [number, number];
    width: number;
    name?: string;
    textAngle?: number;
    textPos?: [number, number];
  }

  // Exact 3D alignment:
  // North Arterial (科技大道) is at Y = 409 (3D Z = -50)
  // South Arterial (创新大道) is at Y = 624 (3D Z = +55)
  // West Arterial (环园西路) is at X = 389 (3D X = -60)
  // East Arterial (申江南路) is at X = 645 (3D X = +65)

  const roads: RoadDef[] = [
    // 1. Northern City Arterial: 科技大道 (Keji Blvd)
    {
      type: 'arterial',
      start: [0, 409],
      end: [1024, 409],
      width: 26,
      name: '科 技 大 道 (Keji Boulevard)',
      textPos: [512, 409]
    },
    // 2. Southern City Arterial: 创新大道 (Chuangxin Blvd)
    {
      type: 'arterial',
      start: [0, 624],
      end: [1024, 624],
      width: 24,
      name: '创 新 大 道 (Chuangxin Avenue)',
      textPos: [512, 624]
    },
    // 3. Western City Arterial: 环园西路 (Huanyuan W Rd)
    {
      type: 'arterial',
      start: [389, 160],
      end: [389, 1024],
      width: 22,
      name: '环 园 西 路',
      textAngle: -Math.PI / 2,
      textPos: [389, 512]
    },
    // 4. Eastern Expressway: 申江南路 (Shenjiang S Rd)
    {
      type: 'arterial',
      start: [645, 80],
      end: [645, 1024],
      width: 24,
      name: '申 江 南 路 (快速路)',
      textAngle: -Math.PI / 2,
      textPos: [645, 512]
    },
    // Campus Gateway Connectors
    // North Gate Connector (Connects 科技大道 Y=409 to Campus North Y=455)
    {
      type: 'connector',
      start: [512, 409],
      end: [512, 455],
      width: 16
    },
    // South Gate Connector (Connects Campus South Y=573 to 创新大道 Y=624)
    {
      type: 'connector',
      start: [512, 573],
      end: [512, 624],
      width: 18
    },
    // East Gate Connector (Connects Campus East X=590 to 申江南路 X=645)
    {
      type: 'connector',
      start: [590, 512],
      end: [645, 512],
      width: 16
    },
    // West Gate Connector (Connects 环园西路 X=389 to Campus West X=434)
    {
      type: 'connector',
      start: [389, 512],
      end: [434, 512],
      width: 16
    }
  ];

  // Draw road casings (borders) first
  roads.forEach(r => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(r.start[0] * S, r.start[1] * S);
    ctx.lineTo(r.end[0] * S, r.end[1] * S);
    ctx.strokeStyle = r.type === 'arterial' ? colors.arterialBorder : colors.secondaryBorder;
    ctx.lineWidth = (r.width + 4) * S;
    ctx.lineCap = 'square';
    ctx.stroke();
    ctx.restore();
  });

  // Draw road inner fills
  roads.forEach(r => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(r.start[0] * S, r.start[1] * S);
    ctx.lineTo(r.end[0] * S, r.end[1] * S);
    ctx.strokeStyle = r.type === 'arterial' ? colors.arterialFill : colors.secondaryFill;
    ctx.lineWidth = r.width * S;
    ctx.lineCap = 'square';
    ctx.stroke();

    // Subtle center dashed lane line for arterials
    if (r.type === 'arterial' && r.width >= 20) {
      ctx.beginPath();
      ctx.moveTo(r.start[0] * S, r.start[1] * S);
      ctx.lineTo(r.end[0] * S, r.end[1] * S);
      ctx.strokeStyle = colors.laneLine;
      ctx.lineWidth = 1.2 * S;
      ctx.setLineDash([8 * S, 8 * S]);
      ctx.stroke();
    }
    ctx.restore();
  });

  // Bridges over River
  const drawBridge = (bx: number, by: number, width: number) => {
    ctx.save();
    ctx.fillStyle = colors.arterialFill;
    ctx.strokeStyle = colors.arterialBorder;
    ctx.lineWidth = 2 * S;
    ctx.fillRect((bx - width / 2) * S, (by - 25) * S, width * S, 50 * S);
    ctx.strokeRect((bx - width / 2) * S, (by - 25) * S, width * S, 50 * S);
    ctx.restore();
  };
  drawBridge(389, 200, 22);
  drawBridge(645, 140, 24);

  // Draw Zebra Crossings at Main Intersections
  const drawCrosswalk = (cx: number, cy: number, w: number, h: number, horizontal = true) => {
    ctx.save();
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.95)';
    const numStripes = 6;
    if (horizontal) {
      const step = w / numStripes;
      for (let i = 0; i < numStripes; i += 2) {
        ctx.fillRect((cx - w / 2 + i * step) * S, (cy - h / 2) * S, (step * 0.8) * S, h * S);
      }
    } else {
      const step = h / numStripes;
      for (let i = 0; i < numStripes; i += 2) {
        ctx.fillRect((cx - w / 2) * S, (cy - h / 2 + i * step) * S, w * S, (step * 0.8) * S);
      }
    }
    ctx.restore();
  };

  drawCrosswalk(389, 409, 28, 10, true);
  drawCrosswalk(645, 409, 28, 10, true);
  drawCrosswalk(389, 624, 28, 10, true);
  drawCrosswalk(645, 624, 28, 10, true);

  // Draw Road Labels
  roads.forEach(r => {
    if (!r.name || !r.textPos) return;
    if (r.textAngle) {
      ctx.save();
      ctx.translate(r.textPos[0] * S, r.textPos[1] * S);
      ctx.rotate(r.textAngle);
      drawHaloText(r.name, 0, 0, colors.textRoad, 11, '600');
      ctx.restore();
    } else {
      drawHaloText(r.name, r.textPos[0], r.textPos[1], colors.textRoad, 11, '600');
    }
  });

  // 7. CENTRAL CAMPUS PERIMETER (安宸商务产业园红线与电子围栏)
  // X: 434 to 590, Y: 455 to 573
  const campusRect = {
    x: 434,
    y: 455,
    w: 156,
    h: 118
  };

  // Subtle interior campus terrain glow
  ctx.save();
  ctx.fillStyle = colors.campusBg;
  ctx.fillRect(
    campusRect.x * S,
    campusRect.y * S,
    campusRect.w * S,
    campusRect.h * S
  );

  // Dashed Electronic Fence
  ctx.strokeStyle = colors.campusBorder;
  ctx.lineWidth = 2 * S;
  ctx.setLineDash([6 * S, 5 * S]);
  ctx.strokeRect(
    campusRect.x * S,
    campusRect.y * S,
    campusRect.w * S,
    campusRect.h * S
  );
  ctx.restore();

  // Corner Coordinate Brackets ⌜ ⌝ ⌞ ⌟
  const drawCornerBracket = (bx: number, by: number, type: 'TL' | 'TR' | 'BL' | 'BR') => {
    ctx.save();
    ctx.strokeStyle = colors.campusBorder;
    ctx.lineWidth = 2.5 * S;
    ctx.beginPath();
    const len = 10 * S;
    if (type === 'TL') {
      ctx.moveTo((bx + len / S) * S, by * S);
      ctx.lineTo(bx * S, by * S);
      ctx.lineTo(bx * S, (by + len / S) * S);
    } else if (type === 'TR') {
      ctx.moveTo((bx - len / S) * S, by * S);
      ctx.lineTo(bx * S, by * S);
      ctx.lineTo(bx * S, (by + len / S) * S);
    } else if (type === 'BL') {
      ctx.moveTo(bx * S, (by - len / S) * S);
      ctx.lineTo(bx * S, by * S);
      ctx.lineTo((bx + len / S) * S, by * S);
    } else if (type === 'BR') {
      ctx.moveTo(bx * S, (by - len / S) * S);
      ctx.lineTo(bx * S, by * S);
      ctx.lineTo((bx - len / S) * S, by * S);
    }
    ctx.stroke();
    ctx.restore();
  };

  drawCornerBracket(campusRect.x, campusRect.y, 'TL');
  drawCornerBracket(campusRect.x + campusRect.w, campusRect.y, 'TR');
  drawCornerBracket(campusRect.x, campusRect.y + campusRect.h, 'BL');
  drawCornerBracket(campusRect.x + campusRect.w, campusRect.y + campusRect.h, 'BR');

  // Campus Gates Labels
  drawHaloText('园区北门', 512, 448, colors.textRoad, 9, '600');
  drawHaloText('园区南主入口', 512, 582, colors.textRoad, 9, '600');
  drawHaloText('园区东门', 598, 512, colors.textRoad, 9, '600', 'left');
  drawHaloText('园区西门', 426, 512, colors.textRoad, 9, '600', 'right');

  // 8. AUTHENTIC AMAP LOCATION PIN & BADGE FOR THE CAMPUS
  const pinX = 512 * S;
  const pinY = 560 * S;

  ctx.save();
  // Pin drop shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(pinX, pinY + 5 * S, 8 * S, 3 * S, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pin body (Teardrop)
  ctx.beginPath();
  ctx.arc(pinX, pinY - 11 * S, 8 * S, 0, Math.PI * 2);
  ctx.fillStyle = colors.pinColor;
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5 * S;
  ctx.stroke();

  // Inner white dot
  ctx.beginPath();
  ctx.arc(pinX, pinY - 11 * S, 3 * S, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();

  // Main Campus Banner Pill
  if (showLabels) {
    const pillW = 200 * S;
    const pillH = 30 * S;
    const pillX = pinX - pillW / 2;
    const pillY = pinY - 46 * S;

    ctx.save();
    ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.12)';
    ctx.shadowBlur = 6 * S;
    ctx.shadowOffsetY = 2 * S;

    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 15 * S);
    ctx.fill();

    ctx.strokeStyle = colors.pinColor;
    ctx.lineWidth = 1.5 * S;
    ctx.stroke();
    ctx.restore();

    drawHaloText('安宸商务产业园 · 数字孪生', 512, 560 - 46 + 10, isDark ? '#38bdf8' : '#0369a1', 11, '700');
    drawHaloText('高德地图 3D GIS 联动空间', 512, 560 - 46 + 22, colors.textDistrict, 8, '500');
  }

  // 9. AMAP MAP ELEMENTS (Scale Bar, Watermark & Copyright)
  const scaleX = 48 * S;
  const scaleY = 980 * S;
  ctx.save();
  ctx.fillStyle = colors.textRoad;
  ctx.strokeStyle = colors.textRoad;
  ctx.lineWidth = 1.5 * S;

  ctx.beginPath();
  ctx.moveTo(scaleX, scaleY - 5 * S);
  ctx.lineTo(scaleX, scaleY);
  ctx.lineTo(scaleX + 70 * S, scaleY);
  ctx.lineTo(scaleX + 70 * S, scaleY - 5 * S);
  ctx.stroke();

  ctx.font = `600 ${9 * S}px "PingFang SC", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('100 米', scaleX + 35 * S, scaleY - 6 * S);

  // AMap Logo & Audit Number Watermark
  ctx.textAlign = 'left';
  ctx.font = `500 ${9 * S}px sans-serif`;
  ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
  ctx.fillText('高德地图 AMap · GS(2023)1234号 · 远山黛浅色底图', scaleX, scaleY + 20 * S);

  // Compass Rose at bottom-right
  const compassX = 960 * S;
  const compassY = 970 * S;
  ctx.beginPath();
  ctx.arc(compassX, compassY, 15 * S, 0, Math.PI * 2);
  ctx.strokeStyle = colors.textRoad;
  ctx.lineWidth = 1.2 * S;
  ctx.stroke();

  ctx.fillStyle = '#ef4444'; // Red North arrow
  ctx.beginPath();
  ctx.moveTo(compassX, compassY - 12 * S);
  ctx.lineTo(compassX - 4 * S, compassY);
  ctx.lineTo(compassX + 4 * S, compassY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = isDark ? '#94a3b8' : '#64748b'; // South arrow
  ctx.beginPath();
  ctx.moveTo(compassX, compassY + 12 * S);
  ctx.lineTo(compassX - 4 * S, compassY);
  ctx.lineTo(compassX + 4 * S, compassY);
  ctx.closePath();
  ctx.fill();

  ctx.font = `bold ${9 * S}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ef4444';
  ctx.fillText('N', compassX, compassY - 15 * S);
  ctx.restore();

  // 10. CREATE THREE.JS CANVAS TEXTURE
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  return texture;
}
