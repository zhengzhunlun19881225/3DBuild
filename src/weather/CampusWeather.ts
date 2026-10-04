import * as THREE from 'three';
import type { WeatherSettings } from '../types/weather';

// Rain and snow vertex animation adapted from ck42bb/procedural-weather-threejs
// commit 26ad580e3ab256f00af9e60e818bffdcfb32aa1e (MIT, Copyright 2026 Kingsley).
// See public/licenses/procedural-weather-MIT.txt. Campus surface shading is local.
const weatherFunctions = `
  uniform float weatherTime;
  uniform float weatherRain;
  uniform float weatherSnow;
  uniform float weatherWet;
  uniform float weatherCover;
  varying vec3 vWeatherPosition;
  varying vec3 vWeatherNormal;
  float weatherHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float weatherNoise(vec2 p) {
    vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(weatherHash(i), weatherHash(i+vec2(1,0)), f.x),
      mix(weatherHash(i+vec2(0,1)),weatherHash(i+vec2(1,1)),f.x),f.y);
  }
`;

export class CampusWeather {
  private group = new THREE.Group();
  private rain: THREE.LineSegments;
  private snow: THREE.Points;
  private surfaces = new Map<THREE.Material, THREE.MeshStandardMaterial>();
  private originals: {mesh: THREE.Mesh; material: THREE.Material | THREE.Material[]}[] = [];
  private clock = 0;
  private uniforms = {
    weatherTime: {value: 0}, weatherRain: {value: 0}, weatherSnow: {value: 0},
    weatherWet: {value: 0}, weatherCover: {value: 0}, wind: {value: 0.25},
    viewportScale: {value: 600},
    roofBoxes: {value: Array.from({length: 8}, () => new THREE.Vector4())},
    roofHeights: {value: Array(8).fill(-100)},
  };

  constructor(private scene: THREE.Scene) {
    this.group.name = 'Campus weather / GPU precipitation';
    this.rain = new THREE.LineSegments(this.particles(12000, true), this.particleMaterial(false));
    this.snow = new THREE.Points(this.particles(10000, false), this.particleMaterial(true));
    this.rain.frustumCulled = this.snow.frustumCulled = false;
    this.rain.raycast = this.snow.raycast = () => {};
    this.group.add(this.rain, this.snow);
    scene.add(this.group);
  }

  private particles(count: number, lines: boolean) {
    const vertices = count * (lines ? 2 : 1);
    const positions = new Float32Array(vertices * 3);
    const seeds = new Float32Array(vertices * 3);
    const tips = new Float32Array(vertices);
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 160;
      const y = Math.random() * 38;
      const z = (Math.random() - 0.5) * 116;
      const seed = Math.random(), phase = Math.random(), size = 0.6 + Math.random();
      for (let j = 0; j < (lines ? 2 : 1); j++) {
        const index = i * (lines ? 2 : 1) + j;
        positions.set([x,y,z], index * 3);
        seeds.set([seed,phase,size], index * 3);
        tips[index] = j;
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3));
    geometry.setAttribute('aTip', new THREE.BufferAttribute(tips, 1));
    return geometry;
  }

  private particleMaterial(snow: boolean) {
    return new THREE.ShaderMaterial({
      name: snow ? 'Weather / snowflakes' : 'Weather / rain streaks',
      uniforms: this.uniforms,
      transparent: true, depthWrite: false, depthTest: true,
      blending: THREE.NormalBlending,
      vertexShader: `
        attribute vec3 aSeed;
        attribute float aTip;
        uniform float weatherTime, weatherRain, weatherSnow, wind, viewportScale;
        uniform vec4 roofBoxes[8];
        uniform float roofHeights[8];
        varying float vAlpha;
        varying float vHeight;
        void main() {
          float t = weatherTime + aSeed.y * 12.0;
          vec3 pos = position;
          float speed = ${snow ? '2.0' : '24.0'} * (0.65 + aSeed.x * 0.7);
          pos.y = mod(position.y - speed * t, 38.0);
          float progress = 1.0 - pos.y / 38.0;
          pos.x += wind * progress * 10.0;
          pos.z += wind * progress * 2.5;
          ${snow ? `pos.x += sin(t * (1.0 + aSeed.x) + aSeed.y * 6.28) * 0.7;
            pos.z += cos(t * 0.8 + aSeed.y * 5.0) * 0.5;` : `
            pos.y -= aTip * (0.85 + aSeed.z * 0.6);
            pos.x += aTip * wind * 0.32;`}
          pos.x = mod(pos.x + 80.0,160.0)-80.0;
          pos.z = mod(pos.z + 58.0,116.0)-58.0;
          float landing = 0.2;
          for (int i=0; i<8; i++) {
            vec4 b = roofBoxes[i];
            if (pos.x > b.x && pos.x < b.z && pos.z > b.y && pos.z < b.w) landing = max(landing, roofHeights[i]);
          }
          float amount = ${snow ? 'weatherSnow' : 'weatherRain'};
          vAlpha = (1.0-step(amount,aSeed.x)) * ${snow ? '0.85' : '0.3'};
          vAlpha *= 1.0-smoothstep(65.0,80.0,abs(pos.x));
          vHeight = pos.y - landing;
          vec4 mv = modelViewMatrix * vec4(pos,1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = clamp(aSeed.z * viewportScale * 0.48 / max(1.0,-mv.z), 1.5, 10.0);
        }`,
      fragmentShader: `
        varying float vAlpha;
        varying float vHeight;
        void main() {
          if (vAlpha < 0.001 || vHeight < 0.0) discard;
          ${snow ? `
            float dist = length(gl_PointCoord-0.5);
            float soft = 1.0-smoothstep(0.15,0.5,dist);
            if (soft < 0.01) discard;
            gl_FragColor = vec4(0.9,0.95,1.0,soft*vAlpha);`
          : 'gl_FragColor = vec4(0.55,0.78,0.95,vAlpha);'}
        }`,
    });
  }

  attachSurfaces(meshes: THREE.Mesh[], bounds: Map<string, THREE.Box3>) {
    [...bounds.values()].slice(0,8).forEach((b,i) => {
      this.uniforms.roofBoxes.value[i].set(b.min.x,b.min.z,b.max.x,b.max.z);
      this.uniforms.roofHeights.value[i] = b.max.y;
    });
    for (const mesh of meshes) {
      // Only ground, roads, paving and roof surfaces receive weather. Facades stay intact.
      if (!/^Campus_Site_(Ground|PublicRoads|InternalRoads|RoadMarkings|Paving|Landscape)_/.test(mesh.name)
        && !/^Campus_(A|B1|B2|C1|C2|C3|D|E)_(RF_|RoofGarden_)/.test(mesh.name)) continue;
      if (/Tree/.test(mesh.name) || !(mesh.material instanceof THREE.MeshStandardMaterial)) continue;
      this.originals.push({mesh, material: mesh.material});
      mesh.material = this.surfaceMaterial(mesh.material);
    }
  }

  materialFor(original: THREE.Material, name: string): THREE.Material {
    if (!/^Campus_Site_(Ground|PublicRoads|InternalRoads|RoadMarkings|Paving|Landscape)_/.test(name)
      && !/^Campus_(A|B1|B2|C1|C2|C3|D|E)_(RF_|RoofGarden_)/.test(name)) return original;
    if (/Tree/.test(name) || !(original instanceof THREE.MeshStandardMaterial)) return original;
    return this.surfaceMaterial(original);
  }

  private surfaceMaterial(source: THREE.MeshStandardMaterial) {
    const existing = this.surfaces.get(source);
    if (existing) return existing;
    const material = source.clone();
    material.name = `${source.name} / weather surface`;
    material.onBeforeCompile = shader => {
      Object.assign(shader.uniforms, this.uniforms);
      shader.vertexShader = 'varying vec3 vWeatherPosition; varying vec3 vWeatherNormal;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        vWeatherPosition = (modelMatrix * vec4(transformed,1.0)).xyz;
        vWeatherNormal = normalize(mat3(modelMatrix) * normal);`);
      shader.fragmentShader = weatherFunctions + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
        float upward = smoothstep(0.45,0.92,normalize(vWeatherNormal).y);
        float surfaceNoise = weatherNoise(vWeatherPosition.xz*0.8)*0.65 + weatherNoise(vWeatherPosition.xz*3.5)*0.35;
        float snowMask = smoothstep(surfaceNoise*0.65, surfaceNoise*0.65+0.28, weatherCover) * upward * step(0.001,weatherCover);
        float wetMask = weatherWet * upward * (0.45+surfaceNoise*0.55);
        diffuseColor.rgb *= 1.0-wetMask*0.5;
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.38,0.46,0.55),snowMask);`);
      shader.fragmentShader = shader.fragmentShader.replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor,0.12,wetMask);
        roughnessFactor = mix(roughnessFactor,0.92,snowMask);`);
      shader.fragmentShader = shader.fragmentShader.replace('#include <metalnessmap_fragment>', `#include <metalnessmap_fragment>
        metalnessFactor = mix(metalnessFactor,0.05,snowMask);`);
      shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        vec2 tile = floor(vWeatherPosition.xz*0.75);
        vec2 local = fract(vWeatherPosition.xz*0.75)-vec2(0.5);
        float seed = weatherHash(tile);
        local -= vec2(seed-0.5,weatherHash(tile+9.3)-0.5)*0.38;
        float age = fract(weatherTime*1.6+seed*11.0);
        float ripple = (1.0-smoothstep(0.016,0.045,abs(length(local)-age*0.42)))*(1.0-age);
        ripple *= step(seed,weatherRain) * wetMask;
        totalEmissiveRadiance *= 1.0-snowMask;
        totalEmissiveRadiance += vec3(0.1,0.3,0.42)*ripple*0.8;
        totalEmissiveRadiance += vec3(0.025,0.035,0.05)*snowMask;`);
    };
    material.customProgramCacheKey = () => 'campus-weather-surface-v1';
    this.surfaces.set(source, material);
    return material;
  }

  update(delta: number, settings: WeatherSettings, enabled: boolean, viewportHeight: number) {
    if (!settings.paused) this.clock += delta;
    this.uniforms.weatherTime.value = this.clock;
    const factor = 1-Math.exp(-delta*3.5);
    const lerp = (uniform: {value: number}, target: number) => { uniform.value += (target-uniform.value)*factor; if (Math.abs(uniform.value-target)<0.0001) uniform.value=target; };
    lerp(this.uniforms.weatherRain, enabled && settings.mode === 'rain' ? settings.intensity : 0);
    lerp(this.uniforms.weatherSnow, enabled && settings.mode === 'snow' ? settings.intensity : 0);
    lerp(this.uniforms.weatherWet, enabled && settings.mode === 'rain' && settings.groundEffect ? settings.coverage : 0);
    lerp(this.uniforms.weatherCover, enabled && settings.mode === 'snow' && settings.groundEffect ? settings.coverage : 0);
    this.uniforms.wind.value = settings.wind;
    this.uniforms.viewportScale.value = viewportHeight;
    this.rain.visible = enabled && this.uniforms.weatherRain.value > 0;
    this.snow.visible = enabled && this.uniforms.weatherSnow.value > 0;
    // Keep themed base colors while retaining the compiled surface shaders.
    for (const [original, mat] of this.surfaces) {
      const source = original as THREE.MeshStandardMaterial;
      mat.color.copy(source.color);
      mat.emissive.copy(source.emissive);
      mat.emissiveIntensity = source.emissiveIntensity;
    }
  }

  dispose() {
    this.originals.forEach(({mesh,material}) => {mesh.material=material;});
    this.group.removeFromParent();
    for (const effect of [this.rain,this.snow]) {
      effect.geometry.dispose();
      (effect.material as THREE.Material).dispose();
    }
    this.surfaces.forEach(material => material.dispose());
    this.surfaces.clear();
  }
}
