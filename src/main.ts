import { App, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";
import Commands from "./commands";
import {  SRSManager } from "./srsManager";
import { DataManager } from "./dataManager";

export default class MemryPlugin extends Plugin {
  commands: Commands;
  srsManager: SRSManager;
  dataManager: DataManager;

  async onload() {
    this.dataManager = new DataManager(this);
    await this.dataManager.load();

    const ribbonIconEl = this.addRibbonIcon(
      "calendar-check",
      "memry",
      (_evt: MouseEvent) => {
        new Notice("This is a notice!");
      }
    );

    const statusBarItemEl = this.addStatusBarItem();
    statusBarItemEl.setText("X notes to review.");

    this.commands = new Commands(this);
    this.commands.addCommands();

    this.srsManager = new SRSManager(this);

    this.addSettingTab(new SampleSettingTab(this.app, this));
  }

  onunload() {}
}

class SampleSettingTab extends PluginSettingTab {
  plugin: MemryPlugin;

  constructor(app: App, plugin: MemryPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Setting #1")
      .setDesc("It's a secret")
      .addText((text) =>
        text
          .setPlaceholder("Enter your secret")
          .setValue(this.plugin.dataManager.settings.mySetting)
          .onChange(async (value) => {
            this.plugin.dataManager.settings.mySetting = value;
            await this.plugin.dataManager.save();
          })
      );
  }
}
