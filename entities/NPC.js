import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export class NPC {
  constructor({ id, name, position, patrol }) {
    this.id = id;
    this.name = name;
    this.patrol = patrol;
    this.currentIndex = 0;

    this.mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 1.6, 6),
      new THREE.MeshStandardMaterial({ color: 0x6b5f4c })
    );
    this.mesh.position.copy(position).setY(0.8);
    this.velocity = new THREE.Vector3();
  }

  update(delta, timeOfDay) {
    const isNight = timeOfDay >= 20 || timeOfDay <= 6;
    if (isNight || !this.patrol || this.patrol.length === 0) {
      return;
    }

    const target = this.patrol[this.currentIndex];
    const targetPos = new THREE.Vector3(target.x, 0.8, target.z);
    const direction = targetPos.clone().sub(this.mesh.position);
    const distance = direction.length();

    if (distance < 0.2) {
      this.currentIndex = (this.currentIndex + 1) % this.patrol.length;
      return;
    }

    direction.normalize();
    this.velocity.copy(direction).multiplyScalar(0.8);
    this.mesh.position.addScaledVector(this.velocity, delta);
    this.mesh.lookAt(targetPos.x, this.mesh.position.y, targetPos.z);
  }
}
