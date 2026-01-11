import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { NPC } from '../entities/NPC.js';
import { Enemy } from '../entities/Enemy.js';

export class World {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
    this.interactables = [];
    this.npcs = [];
    this.enemies = [];
    this.spawnPoint = new THREE.Vector3(0, 1, 8);
    this.lights = {
      sun: null,
      ambient: null
    };

    this.setupEnvironment();
    this.buildVillage();
    this.buildForest();
    this.buildCoast();
    this.spawnNPCs();
    this.spawnEnemy();
  }

  setupEnvironment() {
    this.scene.fog = new THREE.Fog(0x0f1420, 10, 60);
    const skyColor = new THREE.Color(0x1a2233);
    this.scene.background = skyColor;

    const ambient = new THREE.AmbientLight(0x44485f, 0.7);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xc4b58a, 1.2);
    sun.position.set(12, 18, 8);
    sun.castShadow = false;
    this.scene.add(sun);

    this.lights.ambient = ambient;
    this.lights.sun = sun;

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 120, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x243024 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    this.scene.add(ground);
    this.colliders.push(ground);
  }

  buildVillage() {
    const dock = new THREE.Mesh(
      new THREE.BoxGeometry(10, 0.5, 6),
      new THREE.MeshStandardMaterial({ color: 0x3c3a33 })
    );
    dock.position.set(0, 0.25, 10);
    this.scene.add(dock);
    this.colliders.push(dock);

    const boat = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 2.2, 4.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x4a3b2b })
    );
    boat.rotation.z = Math.PI / 2;
    boat.position.set(-4, 0.6, 12);
    this.scene.add(boat);
    this.interactables.push({
      type: 'object',
      label: 'Weathered Boat',
      position: boat.position,
      onInteract: (game) => {
        game.hud.setHint('The boat reeks of salt and chains. It will not leave.');
      }
    });

    const hutPositions = [
      [4, 0.8, 4],
      [-5, 0.8, 2],
      [2, 0.8, -4]
    ];
    hutPositions.forEach((pos, index) => {
      const hut = new THREE.Mesh(
        new THREE.BoxGeometry(4, 2.5, 4),
        new THREE.MeshStandardMaterial({ color: 0x4b4d3f })
      );
      hut.position.set(pos[0], pos[1], pos[2]);
      this.scene.add(hut);
      this.colliders.push(hut);

      const door = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1.8, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x2c2a22 })
      );
      door.position.set(pos[0], 0.9, pos[2] + 2.1);
      this.scene.add(door);

      this.interactables.push({
        type: 'object',
        label: index === 1 ? 'Locked Door' : 'Door',
        position: door.position,
        onInteract: (game) => {
          const message = index === 1
            ? 'A heavy lock keeps this door shut.'
            : 'The door refuses to open. The villagers are not expecting you.';
          game.hud.setHint(message);
        }
      });
    });

    const chest = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.8, 1),
      new THREE.MeshStandardMaterial({ color: 0x5d4a2d })
    );
    chest.position.set(3, 0.4, 1.5);
    this.scene.add(chest);
    this.interactables.push({
      type: 'object',
      label: 'Village Chest',
      position: chest.position,
      opened: false,
      onInteract: (game) => {
        if (!chest.userData.opened) {
          chest.userData.opened = true;
          game.inventorySystem.addItem({ id: 'travel-bread', name: 'Travel Bread', value: 3 });
          game.hud.setHint('You find travel bread wrapped in damp cloth.');
        } else {
          game.hud.setHint('The chest is empty.');
        }
      }
    });

    const campfire = new THREE.Mesh(
      new THREE.ConeGeometry(0.6, 1, 6),
      new THREE.MeshStandardMaterial({ color: 0x6a3d20 })
    );
    campfire.position.set(-1.5, 0.5, 3.5);
    this.scene.add(campfire);
    this.interactables.push({
      type: 'object',
      label: 'Smoldering Campfire',
      position: campfire.position,
      onInteract: (game) => {
        game.player.rest();
        game.hud.setHint('The warmth steadies your hands.');
      }
    });
  }

  buildForest() {
    for (let i = 0; i < 25; i += 1) {
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.4, 2.4, 6),
        new THREE.MeshStandardMaterial({ color: 0x3a2d21 })
      );
      const foliage = new THREE.Mesh(
        new THREE.ConeGeometry(1.2, 2.6, 7),
        new THREE.MeshStandardMaterial({ color: 0x1d3220 })
      );
      const x = (Math.random() - 0.5) * 40 - 10;
      const z = (Math.random() - 0.5) * 40 - 12;
      trunk.position.set(x, 1.2, z);
      foliage.position.set(x, 3.1, z);
      this.scene.add(trunk, foliage);
      this.colliders.push(trunk);
    }

    const cliff = new THREE.Mesh(
      new THREE.BoxGeometry(40, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0x2a2d35 })
    );
    cliff.position.set(0, 4, -28);
    this.scene.add(cliff);
    this.colliders.push(cliff);
  }

  buildCoast() {
    const shore = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 20),
      new THREE.MeshStandardMaterial({ color: 0x2b2c2f })
    );
    shore.rotation.x = -Math.PI / 2;
    shore.position.set(0, 0.02, 18);
    this.scene.add(shore);

    const beast = new THREE.Mesh(
      new THREE.SphereGeometry(3.2, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0x4a5345 })
    );
    beast.position.set(14, 2.4, 18);
    this.scene.add(beast);
    this.interactables.push({
      type: 'object',
      label: 'Sleeping Leviathan',
      position: beast.position,
      onInteract: (game) => {
        game.hud.setHint('It slumbers, its breath stirring the tide.');
      }
    });
  }

  spawnNPCs() {
    const dockkeeper = new NPC({
      id: 'dockkeeper',
      name: 'Harbor Warden',
      position: new THREE.Vector3(-2, 0, 7.5),
      patrol: [
        new THREE.Vector3(-2, 0, 7.5),
        new THREE.Vector3(1, 0, 9.5)
      ]
    });

    const hermit = new NPC({
      id: 'hermit',
      name: 'Silent Hermit',
      position: new THREE.Vector3(6, 0, -2),
      patrol: [
        new THREE.Vector3(6, 0, -2),
        new THREE.Vector3(8, 0, -6)
      ]
    });

    const merchant = new NPC({
      id: 'merchant',
      name: 'Drift Trader',
      position: new THREE.Vector3(-4, 0, 2),
      patrol: [
        new THREE.Vector3(-4, 0, 2),
        new THREE.Vector3(-6, 0, 5)
      ]
    });

    this.npcs.push(dockkeeper, hermit, merchant);
    this.npcs.forEach((npc) => {
      this.scene.add(npc.mesh);
      this.interactables.push({
        type: 'npc',
        label: `${npc.name}`,
        position: npc.mesh.position,
        data: npc
      });
    });
  }

  spawnEnemy() {
    const enemy = new Enemy({
      id: 'shore-wolf',
      name: 'Feral Shorebeast',
      position: new THREE.Vector3(10, 0, -10)
    });
    this.enemies.push(enemy);
    this.scene.add(enemy.mesh);
  }

  registerNPCs(dialogueSystem, questSystem, tradeSystem) {
    dialogueSystem.register('dockkeeper', {
      opening: {
        text: 'You are the new weight they dropped on us. Do not wander past the stones after dusk.',
        choices: [
          { text: 'Who keeps the stones?', next: 'stones' },
          { text: 'I only need passage inland.', next: 'passage' }
        ]
      },
      stones: {
        text: 'Old wards. Older than this village. Bring me proof the woods still breathe.',
        choices: [
          { text: 'What proof?', next: 'proof' },
          { text: 'I will return.', questUpdate: 'main:start', next: 'end' }
        ]
      },
      proof: {
        text: 'The hermit knows. He never speaks unless the night agrees.',
        choices: [
          { text: 'I will find him.', questUpdate: 'main:start', next: 'end' }
        ]
      },
      passage: {
        text: 'Inland? The cliffs ate the road. Talk to the hermit or wait for the beast to wake.',
        choices: [
          { text: 'I will seek the hermit.', questUpdate: 'main:start', next: 'end' }
        ]
      },
      end: {
        text: 'Keep your head low. The fog listens.',
        choices: []
      }
    });

    dialogueSystem.register('hermit', {
      opening: {
        text: 'You were sent for the whisper? The woods remember you even if you do not.',
        choices: [
          { text: 'The warden sent me. I need proof.', next: 'proof' },
          { text: 'What are you guarding?', next: 'guard' }
        ]
      },
      proof: {
        text: 'Take this carved seed. It once belonged to the ward stones.',
        choices: [
          { text: 'I will deliver it.', giveItem: { id: 'ward-seed', name: 'Carved Ward Seed', value: 0 }, questUpdate: 'main:item', next: 'end' }
        ]
      },
      guard: {
        text: 'The fog is a tide. It hides the path and the teeth beneath.',
        choices: [
          { text: 'I should leave.', next: 'end' }
        ]
      },
      end: {
        text: 'Walk softly. Even the sand is awake.',
        choices: []
      }
    });

    dialogueSystem.register('merchant', {
      opening: {
        text: 'You look like you have coins you do not deserve. Trade, if you must.',
        choices: [
          { text: 'Show me what you carry.', openTrade: 'merchant', next: 'end' },
          { text: 'Not now.', next: 'end' }
        ]
      },
      end: {
        text: 'Everything here is borrowed. Even your breath.',
        choices: []
      }
    });

    questSystem.defineQuest({
      id: 'main',
      title: 'The Stone Whisper',
      steps: {
        start: 'Find the hermit in the forest and learn about the ward stones.',
        item: 'Deliver the carved ward seed to the Harbor Warden.',
        done: 'You have earned a wary acceptance among the villagers.'
      }
    });

    tradeSystem.registerMerchant('merchant', {
      name: 'Drift Trader',
      inventory: [
        { id: 'iron-dagger', name: 'Iron Dagger', slot: 'weapon', damage: 4, value: 15 },
        { id: 'leather-jerkin', name: 'Leather Jerkin', slot: 'armor', armor: 2, value: 12 },
        { id: 'smoke-salve', name: 'Smoke Salve', value: 6 }
      ]
    });
  }

  update(delta, timeOfDay) {
    this.npcs.forEach((npc) => npc.update(delta, timeOfDay));
    this.enemies.forEach((enemy) => enemy.update(delta));
  }
}
