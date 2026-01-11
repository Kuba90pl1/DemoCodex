export class InventorySystem {
  constructor() {
    this.items = [];
    this.equipment = { weapon: null, armor: null };
    this.gold = 0;
  }

  addItem(item) {
    this.items.push({ ...item });
  }

  removeItem(itemId) {
    const index = this.items.findIndex((item) => item.id === itemId);
    if (index >= 0) {
      return this.items.splice(index, 1)[0];
    }
    return null;
  }

  equip(itemId) {
    const item = this.items.find((entry) => entry.id === itemId);
    if (!item || !item.slot) {
      return;
    }
    this.equipment[item.slot] = item;
  }

  addGold(amount) {
    this.gold = Math.max(0, this.gold + amount);
  }
}
