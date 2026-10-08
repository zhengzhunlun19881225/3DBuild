import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { SkySettings } from '../types/sky';

/** Official Three.js Sky addon (MIT), with a night blend and matching campus lights. */
export class CampusSky {
  readonly dome = new Sky();
  private last = '';
  private elapsed = 0;
  private direction = new THREE.Vector3();
  private fog = new THREE.FogExp2('#071325', .0018);
  private background = new THREE.Color();
  private dayColor = new THREE.Color('#718fa9');
  private defaults: { hemi: number; sun: number; rim: number; environment: number; exposure: number; position: THREE.Vector3; hemiColor: THREE.Color; sunColor: THREE.Color };

  constructor(private scene: THREE.Scene, private renderer: THREE.WebGLRenderer, private hemi: THREE.HemisphereLight, private sun: THREE.DirectionalLight, private rim: THREE.DirectionalLight) {
    this.defaults = { hemi: hemi.intensity, sun: sun.intensity, rim: rim.intensity, environment: scene.environmentIntensity, exposure: renderer.toneMappingExposure, position: sun.position.clone(), hemiColor: hemi.color.clone(), sunColor: sun.color.clone() };
    this.dome.name = 'Three.js Sky · Campus time simulator';
    this.dome.scale.setScalar(10000);
    this.dome.frustumCulled = false;
    this.dome.renderOrder = -100;
    this.dome.raycast = () => {};
    const material = this.dome.material;
    material.uniforms.campusNight = { value: 0 };
    material.uniforms.campusTint = { value: .55 };
    material.fragmentShader = material.fragmentShader.replace('void main()', 'uniform float campusNight; uniform float campusTint;\nvoid main()').replace('gl_FragColor = vec4( texColor, 1.0 );', `
      vec3 d = normalize(vWorldPosition - cameraPosition);
      vec3 cell = floor(d * 650.0);
      float seed = fract(sin(dot(cell, vec3(127.1,311.7,74.7))) * 43758.5453);
      float star = step(0.998, seed) * smoothstep(0.0, 0.12, d.y);
      vec3 night = mix(vec3(0.015,0.032,0.065), vec3(0.002,0.006,0.020), max(0.0,d.y));
      night += star * vec3(0.42,0.58,0.8);
      // Compress sky radiance before postprocessing so daylight never blooms
      // across the dark dashboard and the technology-blue campus.
      vec3 daylightSky = texColor / (1.0 + dot(texColor, vec3(0.2126,0.7152,0.0722)));
      texColor = mix(daylightSky * campusTint, night, campusNight);
      gl_FragColor = vec4(texColor,1.0);
    `);
    scene.add(this.dome);
  }

  update(settings: SkySettings, delta: number, dark: boolean, outdoor: boolean, precipitation = false) {
    this.elapsed += delta;
    this.dome.visible = settings.enabled && outdoor;
    this.dome.material.uniforms.time.value = this.elapsed;
    const key = `${settings.enabled}:${settings.minutes.toFixed(2)}:${settings.clouds}:${dark}:${outdoor}:${precipitation}`;
    if (key === this.last) return;
    this.last = key;
    if (!settings.enabled || !outdoor) {
      this.hemi.intensity = this.defaults.hemi; this.hemi.color.copy(this.defaults.hemiColor);
      this.sun.intensity = this.defaults.sun; this.sun.color.copy(this.defaults.sunColor); this.sun.position.copy(this.defaults.position);
      this.rim.intensity = this.defaults.rim;
      this.scene.environmentIntensity = this.defaults.environment;
      this.renderer.toneMappingExposure = this.defaults.exposure;
      this.scene.background = this.background.set(dark ? '#040d1a' : '#d5e2ed');
      this.fog.color.copy(this.background); this.scene.fog = this.fog;
      return;
    }
    // Illustrative 06:00 sunrise / 18:00 sunset, not astronomical site ephemeris.
    const angle = (settings.minutes / 60 - 6) / 24 * Math.PI * 2;
    const elevation = Math.sin(angle);
    this.direction.set(-Math.cos(angle), elevation, -.25).normalize();
    const daylight = THREE.MathUtils.smoothstep(elevation, -.1, .35);
    const night = 1 - THREE.MathUtils.smoothstep(elevation, -.22, .04);
    const uniforms = this.dome.material.uniforms;
    uniforms.sunPosition.value.copy(this.direction).multiplyScalar(4500);
    uniforms.turbidity.value = precipitation ? 12 : 4;
    uniforms.rayleigh.value = 2.1;
    uniforms.mieCoefficient.value = precipitation ? .02 : .005;
    uniforms.mieDirectionalG.value = .8;
    uniforms.cloudCoverage.value = Math.max(settings.clouds, precipitation ? .85 : 0);
    uniforms.cloudDensity.value = precipitation ? .85 : .45;
    uniforms.campusNight.value = night;
    uniforms.campusTint.value = dark ? .4 : .8;
    this.sun.position.copy(this.direction).multiplyScalar(110);
    this.sun.intensity = (.18 + daylight * 3.8) * (precipitation ? .55 : 1);
    this.sun.color.set(elevation < .28 ? '#ffb876' : '#e6f3ff');
    this.hemi.intensity = .7 + daylight * 1.65;
    this.hemi.color.set(daylight > .5 ? '#bce5ff' : '#568bc4');
    this.rim.intensity = dark ? 1.8 : .9;
    this.scene.environmentIntensity = .22 + daylight * .43;
    this.renderer.toneMappingExposure = .9 + daylight * .15;
    this.background.set('#081326').lerp(this.dayColor, daylight * (dark ? .55 : 1));
    this.fog.color.copy(this.background); this.fog.density = precipitation ? .0028 : .0012;
    this.scene.fog = this.fog;
    this.scene.background = this.background;
  }

  dispose() { this.scene.remove(this.dome); this.dome.geometry.dispose(); this.dome.material.dispose(); }
}
