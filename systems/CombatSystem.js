import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export class CombatSystem {
  constructor(player, world) {
    this.player = player;
    this.world = world;
    this.attackCooldown = 0;
    this.enemyAttackTimer = 0;
  }

  update(delta) {
    this.attackCooldown = Math.max(0, this.attackCooldown - delta);
    this.enemyAttackTimer += delta;

    this.world.enemies.forEach((enemy) => {
      if (!enemy.active) {
        return;
      }
      const distance = enemy.mesh.position.distanceTo(this.player.mesh.position);
      if (distance < 2.2 && this.enemyAttackTimer > 1.4) {
        this.player.damage(2);
        this.enemyAttackTimer = 0;
      }
    });
  }

  attack() {
    if (this.attackCooldown > 0) {
      return;
    }
    this.attackCooldown = 0.6;

    const weapon = this.player.inventorySystem?.equipment?.weapon;
    const baseDamage = weapon?.damage || 2;

    const playerPos = this.player.mesh.position;
    const forward = new THREE.Vector3();
    this.player.camera.getWorldDirection(forward);

    this.world.enemies.forEach((enemy) => {
      if (!enemy.active) {
        return;
      }
      const toEnemy = enemy.mesh.position.clone().sub(playerPos);
      const distance = toEnemy.length();
      const facing = forward.dot(toEnemy.normalize());
      if (distance < 2.4 && facing > 0.2) {
        enemy.damage(baseDamage);
      }
    });
  }
}
