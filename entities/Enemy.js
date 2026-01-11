import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export class Enemy {
  constructor({ id, name, position }) {
    this.id = id;
    this.name = name;
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0x5a3c2b })
    );
    this.mesh.position.copy(position).setY(0.8);
    this.health = 10;
    this.active = true;
    this.wanderOffset = Math.random() * Math.PI * 2;
  }

  update(delta) {
    if (!this.active) {
      this.mesh.visible = false;
      return;
    }
    this.wanderOffset += delta * 0.2;
    this.mesh.position.x += Math.sin(this.wanderOffset) * 0.03;
    this.mesh.position.z += Math.cos(this.wanderOffset) * 0.03;
  }

  damage(amount) {
    this.health = Math.max(0, this.health - amount);
    if (this.health === 0) {
      this.active = false;
    }
  }
}
