export class TradeSystem {
  constructor(inventorySystem) {
    this.inventorySystem = inventorySystem;
    this.merchants = new Map();
    this.activeMerchant = null;
  }

  registerMerchant(id, data) {
    this.merchants.set(id, data);
  }

  setMerchant(id) {
    this.activeMerchant = this.merchants.get(id) || null;
  }

  buy(item) {
    if (!this.activeMerchant || this.inventorySystem.gold < item.value) {
      return false;
    }
    this.inventorySystem.addGold(-item.value);
    this.inventorySystem.addItem(item);
    return true;
  }

  sell(item) {
    this.inventorySystem.addGold(Math.floor(item.value * 0.6));
    this.inventorySystem.removeItem(item.id);
  }
}
