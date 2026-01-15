import { App, Plugin, PluginSettingTab, Setting } from "obsidian";
import Commands from "./Commands";
import { DataManager } from "./managers/DataManager";
import { Dashboard } from "./Dashboard";
import { NoteManager } from "./managers/NoteManager";
import { MenuItems } from "./MenuItems";
import { getReviewQueue } from "./utils/srsLogic";
import { ReviewManager } from "./managers/ReviewManager";

export default class MemryPlugin extends Plugin {
  commands: Commands;
  noteManager: NoteManager;
  dataManager: DataManager;
  dashboard: Dashboard;
  statusBar: HTMLElement;
  menuItems: MenuItems;
  reviewManager: ReviewManager;

  async onload() {
    this.dataManager = new DataManager(this);
    await this.dataManager.init();

    this.dashboard = new Dashboard(this);
    await this.dashboard.init();

    this.statusBar = this.addStatusBarItem();
    this.rerenderStatusBar();

    this.noteManager = new NoteManager(this);

    this.addSettingTab(new DashboardPathSettingTab(this.app, this));

    this.commands = new Commands(this);
    this.commands.addCommands();

    this.menuItems = new MenuItems(this);
    this.menuItems.init();

    this.registerInterval(
      window.setInterval(() => {
        this.rerenderStatusBar();
      }, 1000 * 15)
    );

    this.reviewManager = new ReviewManager(this);

    this.addRibbonIcon("graduation-cap", "memry", (_evt: MouseEvent) => {
      this.reviewManager.startReview();
    });
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

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onunload(): void {}

  public rerenderStatusBar(text?: string) {
    this.statusBar.setAttr("title", "memry");
    const n = getReviewQueue(this.dataManager.srsData.notes).length;
    if (!text)
      this.rerenderStatusBar(
        `${n.toString()} ${n === 1 ? "note" : "notes"} to review.`
      );
    else this.statusBar.setText(text);
  }
}

class DashboardPathSettingTab extends PluginSettingTab {
  plugin: MemryPlugin;

  constructor(app: App, plugin: MemryPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("dashboard path")
      .setDesc("will require restarting Obsidian")
      .addText((text) =>
        text
          .setPlaceholder("memry dashboard.md")
          .setValue(this.plugin.dataManager.settings.dashboardPath)
          .onChange(async (value) => {
            this.plugin.dataManager.settings.dashboardPath = value;
            await this.plugin.dataManager.save();
          })
      );
  }
}
