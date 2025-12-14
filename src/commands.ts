import { Modal } from "obsidian";
import MemryPlugin from "./main";

export default class Commands {
  plugin: MemryPlugin;

  constructor(plugin: MemryPlugin) {
    this.plugin = plugin;
  }

  addCommands() {
    const plugin = this.plugin;

    plugin.addCommand({
      id: "test",
      name: "Test",
      callback: async () => {
        const id = await this.plugin.srsManager.createSet(
          "test set",
          "does this work chat?"
        );
        await this.plugin.srsManager.upsertNote("economics.md", {
          setId: id,
          lastReview: null,
          nextReview: Date.now() + 86400000,
          stability: 1.0,
          difficulty: 1.5,
          reps: 0,
          lapses: 0,
        });
      },
    });
    plugin.addCommand({
      id: "load",
      name: "Load",
      callback: async () => {
        await this.plugin.dataManager.load();
      },
    });
  }
}
