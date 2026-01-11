import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export class Player {
  constructor(scene, camera, input) {
    this.scene = scene;
    this.camera = camera;
    this.input = input;
    this.viewMode = 'first';

    this.mesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.3, 1.0, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0x5a6b7a })
    );
    this.mesh.position.set(0, 1, 8);
    this.mesh.visible = false;
    this.scene.add(this.mesh);

    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.speed = 4.2;
    this.turnSpeed = 2.4;

    this.maxHealth = 20;
    this.health = this.maxHealth;
    this.stamina = 12;
    this.dead = false;

    this.pitch = 0;
    this.yaw = Math.PI;

    this.raycaster = new THREE.Raycaster();
  }

  toggleView() {
    this.viewMode = this.viewMode === 'first' ? 'third' : 'first';
    this.mesh.visible = this.viewMode === 'third';
  }

  update(delta, colliders) {
    const move = this.input.getMoveVector();
    const mouse = this.input.consumeMouseDelta();

    this.yaw -= mouse.x * 0.0025;
    this.pitch -= mouse.y * 0.0025;
    this.pitch = Math.max(-1.1, Math.min(1.1, this.pitch));

    const forward = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    const right = new THREE.Vector3(forward.z, 0, -forward.x);
    this.direction.set(0, 0, 0);
    this.direction.addScaledVector(forward, move.y);
    this.direction.addScaledVector(right, move.x);
    if (this.direction.lengthSq() > 0) {
      this.direction.normalize();
    }

    const targetVelocity = this.direction.clone().multiplyScalar(this.speed);
    this.velocity.lerp(targetVelocity, 0.12);

    const prevPosition = this.mesh.position.clone();
    this.mesh.position.addScaledVector(this.velocity, delta);

    if (this.checkCollision(colliders)) {
      this.mesh.position.copy(prevPosition);
      this.velocity.set(0, 0, 0);
    }

    this.updateCamera();
  }

  updateCamera() {
    if (this.viewMode === 'first') {
      this.camera.position.copy(this.mesh.position).add(new THREE.Vector3(0, 0.9, 0));
    } else {
      const offset = new THREE.Vector3(
        Math.sin(this.yaw) * -4,
        2.2,
        Math.cos(this.yaw) * -4
      );
      this.camera.position.copy(this.mesh.position).add(offset);
    }

    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
  }

  checkCollision(colliders) {
    const playerBox = new THREE.Box3().setFromCenterAndSize(
      this.mesh.position,
      new THREE.Vector3(0.8, 1.8, 0.8)
    );
    return colliders.some((collider) => {
      const colliderBox = new THREE.Box3().setFromObject(collider);
      return playerBox.intersectsBox(colliderBox);
    });
  }

  getInteractable(interactables) {
    const origin = this.camera.position.clone();
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    this.raycaster.set(origin, direction);
    const maxDistance = 3;

    let closest = null;
    let closestDistance = Infinity;
    interactables.forEach((item) => {
      const distance = item.position.distanceTo(origin);
      if (distance < maxDistance && distance < closestDistance) {
        closest = item;
        closestDistance = distance;
      }
    });
    return closest;
  }

  damage(amount) {
    this.health = Math.max(0, this.health - amount);
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  rest() {
    this.heal(4);
    this.stamina = Math.min(12, this.stamina + 4);
  }

  isDead() {
    return this.health <= 0;
  }

  respawn(position) {
    this.mesh.position.copy(position);
    this.health = this.maxHealth;
    this.stamina = 12;
  }
}
