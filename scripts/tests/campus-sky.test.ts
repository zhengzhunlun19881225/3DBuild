import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CampusSky } from '../../src/sky/CampusSky';
import { DEFAULT_SKY, formatSkyTime } from '../../src/types/sky';

function fixture() {
  const scene = new THREE.Scene();
  const renderer = { toneMappingExposure: 1.05 } as THREE.WebGLRenderer;
  const hemi = new THREE.HemisphereLight('#bcefff', '#182a45', 2.4);
  const sun = new THREE.DirectionalLight('#e0f2fe', 3.4);
  sun.position.set(-45, 85, 40);
  const rim = new THREE.DirectionalLight('#38bdf8', 2.8);
  const effect = new CampusSky(scene, renderer, hemi, sun, rim);
  return { scene, hemi, sun, effect };
}

test('daylight moves the sun above the campus and night keeps buildings visible', () => {
  const { sun, hemi, effect } = fixture();
  effect.update({ ...DEFAULT_SKY, minutes: 720 }, .016, true, true);
  const daylight = sun.intensity;
  assert.ok(sun.position.y > 0);
  effect.update({ ...DEFAULT_SKY, minutes: 0 }, .016, true, true);
  assert.ok(sun.position.y < 0);
  assert.ok(sun.intensity < daylight);
  assert.ok(hemi.intensity > 0);
  assert.equal(effect.dome.material.uniforms.campusNight.value, 1);
  effect.dispose();
});
test('rain increases cloud cover and attenuates daylight without changing requested time', () => {
  const { sun, effect } = fixture();
  const settings = { ...DEFAULT_SKY, minutes: 720, clouds: 0 };
  effect.update(settings, .016, true, true);
  const clear = sun.intensity;
  effect.update(settings, .016, true, true, true);
  assert.ok(sun.intensity < clear);
  assert.ok(effect.dome.material.uniforms.cloudCoverage.value > settings.clouds);
  assert.equal(settings.minutes, 720);
  effect.dispose();
});
test('disabling sky or drilling inside restores campus lighting and releases sky resources', () => {
  const { scene, sun, hemi, effect } = fixture();
  effect.update({ ...DEFAULT_SKY, minutes: 0 }, .016, true, true);
  effect.update({ ...DEFAULT_SKY, enabled: false }, .016, true, true);
  assert.equal(effect.dome.visible, false);
  assert.equal(sun.intensity, 3.4);
  assert.equal(hemi.intensity, 2.4);
  assert.deepEqual(sun.position.toArray(), [-45,85,40]);
  effect.update(DEFAULT_SKY, .016, true, false);
  assert.equal(effect.dome.visible, false);
  let disposed = 0;
  effect.dome.geometry.addEventListener('dispose', () => disposed++);
  effect.dome.material.addEventListener('dispose', () => disposed++);
  effect.dispose();
  assert.equal(disposed, 2);
  assert.equal(scene.children.includes(effect.dome), false);
});
test('time label wraps midnight and does not expose fractional minutes', () => {
  assert.equal(formatSkyTime(1439.9), '23:59');
  assert.equal(formatSkyTime(1440), '00:00');
  assert.equal(formatSkyTime(360), '06:00');
});
