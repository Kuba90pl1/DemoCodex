export class DialogueUI {
  constructor(container) {
    this.container = container;
    this.onChoice = null;
    this.onClose = null;
    this.currentNode = null;
  }

  open(node, onChoice, onClose) {
    if (!node) {
      return;
    }
    this.onChoice = onChoice;
    this.onClose = onClose;
    this.currentNode = node;
    this.container.style.display = 'block';
    this.render(node);
  }

  update(node) {
    if (!node) {
      return;
    }
    this.currentNode = node;
    this.render(node);
  }

  updateChoices() {
    if (!this.currentNode) {
      return;
    }
    const buttons = this.container.querySelectorAll('button');
    buttons.forEach((button, index) => {
      button.onclick = () => {
        if (this.onChoice) {
          this.onChoice(index);
        }
      };
    });
  }

  render(node) {
    const choices = node.choices || [];
    const buttons = choices.length
      ? choices.map((choice) => `<button>${choice.text}</button>`).join('')
      : '<button>Leave</button>';
    this.container.innerHTML = `
      <div style="margin-bottom: 8px;">${node.text}</div>
      ${buttons}
    `;
    if (choices.length === 0) {
      const button = this.container.querySelector('button');
      button.onclick = () => {
        if (this.onClose) {
          this.onClose();
        }
      };
    }
  }

  close() {
    this.container.style.display = 'none';
    this.container.innerHTML = '';
    this.currentNode = null;
  }

  isOpen() {
    return this.container.style.display === 'block';
  }
}
