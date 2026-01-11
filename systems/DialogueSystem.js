export class DialogueSystem {
  constructor() {
    this.dialogues = new Map();
    this.active = null;
    this.currentNode = null;
  }

  register(id, data) {
    this.dialogues.set(id, data);
  }

  startDialogue(id) {
    const dialogue = this.dialogues.get(id);
    if (!dialogue) {
      return null;
    }
    this.active = dialogue;
    this.currentNode = 'opening';
    return this.active[this.currentNode];
  }

  advance(choiceIndex) {
    if (!this.active) {
      return null;
    }
    const node = this.active[this.currentNode];
    const choice = node.choices[choiceIndex];
    if (!choice) {
      return node;
    }
    if (choice.next) {
      this.currentNode = choice.next;
      return { ...this.active[this.currentNode], questUpdate: choice.questUpdate, giveItem: choice.giveItem, openTrade: choice.openTrade };
    }
    return node;
  }

  endDialogue() {
    this.active = null;
    this.currentNode = null;
  }
}
