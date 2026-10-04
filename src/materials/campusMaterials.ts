import * as THREE from 'three';

/**
 * Fresnel + animated scanline material adapted from Anderson Mancini's
 * https://github.com/ektogamat/threejs-holographic-material (MIT).
 * Copyright (c) 2023 Anderson Mancini dos Santos.
 * License: public/licenses/holographic-material-MIT.txt.
 * Adaptation: native Three.js, corrected world transforms, no flicker,
 * UV-independent world-space scanning for the untextured campus OBJ.
 */
export function createHologramMaterial() {
  return new THREE.ShaderMaterial({
    name: 'Campus / holographic glass',
    uniforms: {
      time: { value: 0 }, color: { value: new THREE.Color('#22d3ee') },
      intensity: { value: 0.65 },
    },
    vertexShader: `
      varying vec3 vPositionW;
      varying vec3 vNormalW;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vPositionW = world.xyz;
        vNormalW = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * world;
      }`,
    fragmentShader: `
      uniform float time;
      uniform float intensity;
      uniform vec3 color;
      varying vec3 vPositionW;
      varying vec3 vNormalW;
      void main() {
        vec3 viewDirectionW = normalize(cameraPosition - vPositionW);
        float fresnel = pow(1.0 - abs(dot(viewDirectionW, normalize(vNormalW))), 2.4);
        float scanlines = 0.5 + 0.5 * sin(vPositionW.y * 12.0 - time * 1.4);
        float sweep = exp(-pow((mod(vPositionW.y - time * 1.8 + 40.0, 24.0) - 12.0) * 1.5, 2.0));
        float light = 0.08 + fresnel * 0.48 + scanlines * 0.05 + sweep * 0.8;
        gl_FragColor = vec4(color * (0.65 + light * 1.6), light * intensity);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}

export type MaterialStyle = 'metal' | 'hologram';

export const isCampusRoof = (name: string) => /^Campus_(A|B1|B2|C1|C2|C3|D|E)_(RF_|RoofGarden_)/.test(name);

export function createCampusMaterials() {
  const physical = (name: string, color: string, metalness: number, roughness: number) => {
    const mat = new THREE.MeshPhysicalMaterial({ color, metalness, roughness, clearcoat: 0.35, clearcoatRoughness: 0.25 });
    mat.name = `Campus / ${name}`;
    return mat;
  };
  const materials = {
    shell: physical('titanium envelope', '#294860', 0.62, 0.32),
    concrete: physical('structure', '#1a3045', 0.25, 0.65),
    glass: physical('cyan coated glass', '#11769a', 0.8, 0.16),
    frame: physical('brushed metal', '#274359', 0.82, 0.3),
    roof: physical('technology blue roof', '#0868df', 0.48, 0.32),
    ground: physical('site', '#081825', 0.15, 0.9),
    road: physical('asphalt', '#0a1826', 0.15, 0.7),
    paving: physical('paving', '#25404f', 0.32, 0.7),
    green: physical('landscape', '#082c2c', 0.12, 0.9),
    context: physical('context', '#122536', 0.2, 0.8),
    markings: new THREE.MeshStandardMaterial({ color: '#2a7c92', emissive: '#0891b2', emissiveIntensity: 0.2 }),
    hologram: createHologramMaterial(),
    roofHologram: createHologramMaterial(),
    edges: new THREE.LineBasicMaterial({ color: '#31c5e6', transparent: true, opacity: 0.3, toneMapped: false }),
    selectedEdges: new THREE.LineBasicMaterial({ color: '#a5f3fc', transparent: true, opacity: 0.95, toneMapped: false }),
  };
  materials.glass.iridescence = 0.3;
  materials.glass.iridescenceIOR = 1.3;
  materials.glass.emissive.set('#036b85');
  materials.glass.emissiveIntensity = 0.28;
  materials.roof.emissive.set('#075be0');
  materials.roof.emissiveIntensity = 0.22;
  materials.roofHologram.name = 'Campus / technology blue holographic roof';
  materials.roofHologram.uniforms.color.value.set('#1687ff');

  function forName(name: string): THREE.Material {
    if (/SurroundingBuildings/.test(name)) return materials.context;
    if (isCampusRoof(name)) return materials.roof;
    if (/Lane|Markings/.test(name)) return materials.markings;
    if (/Glass/.test(name)) return materials.glass;
    if (/Tree|Garden|Grass|Landscape/.test(name)) return materials.green;
    if (/Road/.test(name) && !/Curb/.test(name)) return materials.road;
    if (/Paving|Plaza|Curb/.test(name)) return materials.paving;
    if (/Ground/.test(name)) return materials.ground;
    if (/Frame|Steel|Louver|Charcoal|DarkGrey/.test(name)) return materials.frame;
    if (/Concrete/.test(name)) return materials.concrete;
    if (/Roof/.test(name)) return materials.roof;
    return materials.shell;
  }
  function setTheme(dark: boolean) {
    materials.shell.color.set(dark ? '#294860' : '#b8cad8');
    materials.concrete.color.set(dark ? '#1a3045' : '#8395a7');
    materials.ground.color.set(dark ? '#081825' : '#b7cad0');
    materials.context.color.set(dark ? '#122536' : '#8da3b4');
    materials.edges.opacity = dark ? 0.3 : 0.18;
    materials.glass.emissiveIntensity = dark ? 0.28 : 0.08;
    materials.roof.emissiveIntensity = dark ? 0.22 : 0.08;
  }
  return { ...materials, forName, setTheme, dispose: () => Object.values(materials).forEach(m => m.dispose()) };
}
