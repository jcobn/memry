import {
  App,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  WorkspaceLeaf,
} from "obsidian";
import Commands from "./commands";
import { SRSManager } from "./srsManager";
import { DataManager } from "./dataManager";
import { Dashboard } from "./dashboard";

export default class MemryPlugin extends Plugin {
  commands: Commands;
  srsManager: SRSManager;
  dataManager: DataManager;
  dashboard: Dashboard;
  statusBar: HTMLElement;

  async onload() {
    this.dataManager = new DataManager(this);
    await this.dataManager.init();

    const ribbonIconEl = this.addRibbonIcon(
      "calendar-check",
      "memry",
      (_evt: MouseEvent) => {
        new Notice("This is a notice!");
      }
    );

    this.statusBar = this.addStatusBarItem();
    this.statusBar.setText("X notes to review.");

    this.commands = new Commands(this);
    this.commands.addCommands();

    this.srsManager = new SRSManager(this);

    this.addSettingTab(new SampleSettingTab(this.app, this));

    this.dashboard = new Dashboard(this);
    await this.dashboard.init();

    /* this.registerView(
      SRS_VIEW_TYPE,
      (leaf: WorkspaceLeaf) => new SRSDashboardView(leaf, this)
    );

    this.app.workspace.onLayoutReady(async () => {
      if (!!this.app.workspace.getLeavesOfType(SRS_VIEW_TYPE).length) return;
      const leaf = this.app.workspace.getRightLeaf(false); // false = create new leaf if empty
      if (leaf === null) {
        throw new Error("couldnt create leaf");
      }
      await leaf.setViewState({ type: SRS_VIEW_TYPE });
    }); */
  }

  onunload() {}

  public rerenderStatusBar(text: string) {
    this.statusBar.setText(text);
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
          .setValue(this.plugin.dataManager.settings.mySetting)
          .onChange(async (value) => {
            this.plugin.dataManager.settings.mySetting = value;
            await this.plugin.dataManager.save();
          })
      );
  }
}
