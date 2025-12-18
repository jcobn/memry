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
        await this.plugin.dashboard.rerender();
      },
    });
    plugin.addCommand({
      id: "load",
      name: "Load",
      callback: async () => {
        await this.plugin.dataManager.init();
      },
    });
  }
}
