import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export class TimeSystem {
  constructor(world) {
    this.world = world;
    this.timeOfDay = 7.5;
    this.speed = 0.2;
  }

  update(delta) {
    this.timeOfDay += delta * this.speed;
    if (this.timeOfDay >= 24) {
      this.timeOfDay -= 24;
    }

    const phase = this.timeOfDay / 24;
    const sunAngle = phase * Math.PI * 2;
    const sunHeight = Math.sin(sunAngle) * 0.5 + 0.6;
    const colorDay = new THREE.Color(0xc9b891);
    const colorNight = new THREE.Color(0x2a3852);

    const mix = Math.max(0, Math.sin(sunAngle));
    const sunColor = colorNight.clone().lerp(colorDay, mix);
    const ambientIntensity = 0.2 + mix * 0.6;
    const sunIntensity = 0.2 + mix * 1.2;

    this.world.lights.sun.position.set(12, 12 * sunHeight + 4, 8);
    this.world.lights.sun.color = sunColor;
    this.world.lights.sun.intensity = sunIntensity;
    this.world.lights.ambient.intensity = ambientIntensity;

    this.world.scene.fog.color = new THREE.Color(0x0f1420).lerp(new THREE.Color(0x6e7a8d), mix * 0.6);
    this.world.scene.background = new THREE.Color(0x0f1420).lerp(new THREE.Color(0x445069), mix * 0.3);
  }

  getTimeString() {
    const hours = Math.floor(this.timeOfDay);
    const minutes = Math.floor((this.timeOfDay - hours) * 60);
    const padded = `${hours}`.padStart(2, '0');
    const min = `${minutes}`.padStart(2, '0');
    return `${padded}:${min}`;
  }
}
