export class QuestSystem {
  constructor() {
    this.quests = new Map();
    this.activeQuest = null;
  }

  defineQuest(quest) {
    this.quests.set(quest.id, quest);
  }

  update(action) {
    const [id, step] = action.split(':');
    const quest = this.quests.get(id);
    if (!quest) {
      return;
    }
    if (!this.activeQuest || this.activeQuest.id !== id) {
      this.activeQuest = { id, title: quest.title, step: step, description: quest.steps[step] };
    } else {
      this.activeQuest.step = step;
      this.activeQuest.description = quest.steps[step];
    }
  }
}
