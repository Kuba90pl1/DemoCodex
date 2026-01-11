import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { World } from './World.js';
import { TimeSystem } from './TimeSystem.js';
import { InputSystem } from '../systems/InputSystem.js';
import { DialogueSystem } from '../systems/DialogueSystem.js';
import { QuestSystem } from '../systems/QuestSystem.js';
import { InventorySystem } from '../systems/InventorySystem.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { TradeSystem } from '../systems/TradeSystem.js';
import { HUD } from '../ui/HUD.js';
import { DialogueUI } from '../ui/DialogueUI.js';
import { InventoryUI } from '../ui/InventoryUI.js';
import { Player } from '../entities/Player.js';

export class Game {
  constructor() {
    this.container = document.body;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);

    this.clock = new THREE.Clock();
    this.world = new World(this.scene);
    this.timeSystem = new TimeSystem(this.world);
    this.input = new InputSystem(this.renderer.domElement);
    this.player = new Player(this.scene, this.camera, this.input);
    this.dialogueSystem = new DialogueSystem();
    this.questSystem = new QuestSystem();
    this.inventorySystem = new InventorySystem();
    this.combatSystem = new CombatSystem(this.player, this.world);
    this.tradeSystem = new TradeSystem(this.inventorySystem);

    this.player.inventorySystem = this.inventorySystem;

    this.hud = new HUD(document.getElementById('hud'), document.getElementById('hint'));
    this.dialogueUI = new DialogueUI(document.getElementById('dialogue'));
    this.inventoryUI = new InventoryUI(
      document.getElementById('inventory'),
      document.getElementById('trade')
    );

    this.isPaused = false;

    window.addEventListener('resize', () => this.handleResize());
    this.handleResize();
    this.bindInput();
    this.seedData();
  }

  bindInput() {
    this.input.on('toggleView', () => this.player.toggleView());
    this.input.on('interact', () => this.handleInteraction());
    this.input.on('inventory', () => this.toggleInventory());
    this.input.on('attack', () => this.handleAttack());
    this.input.on('closeUI', () => this.closeUI());
  }

  seedData() {
    this.inventorySystem.addGold(12);
    this.inventorySystem.addItem({ id: 'rusty-sword', name: 'Rusty Sword', slot: 'weapon', damage: 3, value: 8 });
    this.inventorySystem.addItem({ id: 'patched-coat', name: 'Patched Coat', slot: 'armor', armor: 1, value: 5 });
    this.inventorySystem.equip('rusty-sword');
    this.inventorySystem.equip('patched-coat');

    this.world.registerNPCs(this.dialogueSystem, this.questSystem, this.tradeSystem);
  }

  start() {
    const prompt = document.getElementById('prompt');
    prompt.addEventListener('click', () => {
      prompt.style.display = 'none';
      this.input.lock();
    });
    this.animate();
  }

  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  handleInteraction() {
    if (this.dialogueUI.isOpen()) {
      return;
    }
    const target = this.player.getInteractable(this.world.interactables);
    if (!target) {
      return;
    }
    if (target.type === 'npc') {
      if (target.data.id === 'dockkeeper') {
        const hasSeed = this.inventorySystem.items.find((item) => item.id === 'ward-seed');
        if (hasSeed) {
          this.inventorySystem.removeItem('ward-seed');
          this.inventorySystem.addGold(10);
          this.questSystem.update('main:done');
          this.hud.setHint('The warden takes the seed and slips you coin.');
        }
      }
      const dialogue = this.dialogueSystem.startDialogue(target.data.id);
      this.dialogueUI.open(dialogue, (choice) => {
        const response = this.dialogueSystem.advance(choice);
        this.dialogueUI.update(response);
        this.applyDialogueEffects(response);
      }, () => {
        this.dialogueSystem.endDialogue();
        this.dialogueUI.close();
      });
    } else {
      target.onInteract(this);
    }
  }

  applyDialogueEffects(response) {
    if (!response) {
      return;
    }
    if (response.questUpdate) {
      this.questSystem.update(response.questUpdate);
    }
    if (response.giveItem) {
      this.inventorySystem.addItem(response.giveItem);
    }
    if (response.openTrade) {
      this.tradeSystem.setMerchant(response.openTrade);
      this.inventoryUI.openTrade(this.tradeSystem);
    }
  }

  handleAttack() {
    if (this.dialogueUI.isOpen() || this.inventoryUI.isOpen()) {
      return;
    }
    this.combatSystem.attack();
  }

  toggleInventory() {
    if (this.dialogueUI.isOpen()) {
      return;
    }
    if (this.inventoryUI.isOpen()) {
      this.inventoryUI.close();
      return;
    }
    this.inventoryUI.openInventory(this.inventorySystem);
  }

  closeUI() {
    this.dialogueUI.close();
    this.inventoryUI.close();
  }

  update(delta) {
    this.timeSystem.update(delta);
    this.player.update(delta, this.world.colliders);
    this.world.update(delta, this.timeSystem.timeOfDay);
    this.combatSystem.update(delta);

    if (this.player.isDead()) {
      this.player.respawn(this.world.spawnPoint);
      this.inventorySystem.addGold(-2);
    }

    this.hud.update({
      health: this.player.health,
      maxHealth: this.player.maxHealth,
      stamina: this.player.stamina,
      gold: this.inventorySystem.gold,
      quest: this.questSystem.activeQuest,
      time: this.timeSystem.getTimeString(),
      view: this.player.viewMode
    });

    const hint = this.player.getInteractable(this.world.interactables);
    this.hud.setHint(hint ? `[E] ${hint.label}` : '');

    this.dialogueUI.updateChoices();
    this.inventoryUI.update();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const delta = this.clock.getDelta();
    this.update(delta);
    this.renderer.render(this.scene, this.camera);
  }
}
