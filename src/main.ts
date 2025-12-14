import {
  App,
  Editor,
  MarkdownView,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
} from "obsidian";
import Commands from "./commands";
import { DataStore } from "./data";

interface MemrySettings {
  mySetting: string;
}

const DEFAULT_SETTINGS: MemrySettings = {
  mySetting: "default",
};

export default class MemryPlugin extends Plugin {
  settings: MemrySettings;
  commands: Commands;
  dataStore: DataStore;

  async onload() {
    await this.loadSettings();

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

    this.dataStore = new DataStore(this);
    await this.dataStore.load();

    this.addSettingTab(new SampleSettingTab(this.app, this));
  }

  onunload() {}

  async loadSettings() {
    const data = await this.loadData();
    if (!!data?.settings) {
      this.settings = Object.assign({}, DEFAULT_SETTINGS, data?.settings);
    } else {
      this.settings = DEFAULT_SETTINGS;
    }
  }

  async saveSettings() {
    await this.saveData({
      settings: this.settings,
      srsData: this.dataStore.srsData,
    });
  }
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
          .setValue(this.plugin.settings.mySetting)
          .onChange(async (value) => {
            this.plugin.settings.mySetting = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
