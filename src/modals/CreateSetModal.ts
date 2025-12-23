import { ButtonComponent, Modal, Setting } from "obsidian";
import MemryPlugin from "src/main";
import { memryNotice } from "src/utils/notice";

export class CreateSetModal extends Modal {
  private plugin: MemryPlugin;
  private name = "";
  private description = "";

  constructor(plugin: MemryPlugin) {
    super(plugin.app);
    this.plugin = plugin;
  }

  onOpen(): Promise<void> | void {
    let button: ButtonComponent | null = null;
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "🏫 create new set" });
    new Setting(contentEl).setName("name").addText((text) => {
      text.onChange((value) => {
        this.name = value.trim();
        button?.setDisabled(!value);
      });
    });
    new Setting(contentEl).setName("description (optional)").addText((text) => {
      text.onChange((value) => {
        this.description = value.trim();
      });
    });
    new Setting(contentEl).addButton((b) => {
      button = b;
      b.setButtonText("create")
        .setCta()
        .setDisabled(true)
        .onClick(async () => {
          if (!this.name) return;
          this.close();
          await this.plugin.noteManager.createSet(this.name, this.description);
          memryNotice("created new set " + this.name);
        });
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}
