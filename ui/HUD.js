export class HUD {
  constructor(container, hint) {
    this.container = container;
    this.hint = hint;
  }

  update({ health, maxHealth, stamina, gold, quest, time, view }) {
    const questText = quest ? `<div><strong>${quest.title}</strong><br/>${quest.description}</div>` : '<div><strong>Windswept Exile</strong><br/>Find a place to belong.</div>';
    this.container.innerHTML = `
      <div>Health: ${health}/${maxHealth}</div>
      <div>Stamina: ${stamina}</div>
      <div>Gold: ${gold}</div>
      <div>Time: ${time}</div>
      <div>View: ${view === 'first' ? 'First Person' : 'Third Person'}</div>
      <hr style="border-color: rgba(255,255,255,0.1);"/>
      ${questText}
    `;
  }

  setHint(text) {
    this.hint.textContent = text;
  }
}
