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
        const id = await this.plugin.dataStore.createSet(
          "test set",
          "does this work chat?"
        );
        await this.plugin.dataStore.upsertNote("economics.md", {
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
  }
}
