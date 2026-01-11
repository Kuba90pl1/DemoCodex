export class InventoryUI {
  constructor(container, tradeContainer) {
    this.container = container;
    this.tradeContainer = tradeContainer;
    this.inventorySystem = null;
    this.tradeSystem = null;
  }

  openInventory(inventorySystem) {
    this.inventorySystem = inventorySystem;
    this.container.style.display = 'block';
    this.renderInventory();
  }

  openTrade(tradeSystem) {
    this.tradeSystem = tradeSystem;
    this.tradeContainer.style.display = 'block';
    this.renderTrade();
  }

  renderInventory() {
    if (!this.inventorySystem) {
      return;
    }
    const equipment = this.inventorySystem.equipment;
    const items = this.inventorySystem.items
      .map((item) => {
        const equipButton = item.slot ? `<button data-equip="${item.id}">Equip ${item.slot}</button>` : '';
        return `<div style="margin-bottom: 6px;">
          <strong>${item.name}</strong> (${item.value || 0}g)
          ${equipButton}
        </div>`;
      })
      .join('');

    this.container.innerHTML = `
      <div style="margin-bottom: 8px;"><strong>Inventory</strong></div>
      <div>Weapon: ${equipment.weapon ? equipment.weapon.name : 'None'}</div>
      <div>Armor: ${equipment.armor ? equipment.armor.name : 'None'}</div>
      <hr style="border-color: rgba(255,255,255,0.1);"/>
      ${items || '<div>Empty</div>'}
    `;

    this.container.querySelectorAll('[data-equip]').forEach((button) => {
      button.onclick = () => {
        const id = button.getAttribute('data-equip');
        this.inventorySystem.equip(id);
        this.renderInventory();
      };
    });
  }

  renderTrade() {
    if (!this.tradeSystem || !this.tradeSystem.activeMerchant) {
      return;
    }
    const merchant = this.tradeSystem.activeMerchant;
    const merchantItems = merchant.inventory
      .map((item, index) => `<button data-buy="${index}">Buy ${item.name} (${item.value}g)</button>`)
      .join('');

    const sellItems = this.tradeSystem.inventorySystem.items
      .map((item) => `<button data-sell="${item.id}">Sell ${item.name} (${Math.floor(item.value * 0.6)}g)</button>`)
      .join('');

    this.tradeContainer.innerHTML = `
      <div style="margin-bottom: 8px;"><strong>${merchant.name}</strong></div>
      <div style="font-size: 12px; opacity: 0.8;">Trade quietly. The fog counts coin.</div>
      <hr style="border-color: rgba(255,255,255,0.1);"/>
      ${merchantItems || '<div>Nothing for sale.</div>'}
      <hr style="border-color: rgba(255,255,255,0.1);"/>
      ${sellItems || '<div>You have nothing to sell.</div>'}
    `;

    this.tradeContainer.querySelectorAll('[data-buy]').forEach((button) => {
      button.onclick = () => {
        const index = Number(button.getAttribute('data-buy'));
        const item = merchant.inventory[index];
        this.tradeSystem.buy(item);
        this.renderTrade();
        this.renderInventory();
      };
    });

    this.tradeContainer.querySelectorAll('[data-sell]').forEach((button) => {
      button.onclick = () => {
        const id = button.getAttribute('data-sell');
        const item = this.tradeSystem.inventorySystem.items.find((entry) => entry.id === id);
        if (item) {
          this.tradeSystem.sell(item);
          this.renderTrade();
          this.renderInventory();
        }
      };
    });
  }

  update() {
    if (this.container.style.display === 'block') {
      this.renderInventory();
    }
    if (this.tradeContainer.style.display === 'block') {
      this.renderTrade();
    }
  }

  close() {
    this.container.style.display = 'none';
    this.tradeContainer.style.display = 'none';
  }

  isOpen() {
    return this.container.style.display === 'block' || this.tradeContainer.style.display === 'block';
  }
}
