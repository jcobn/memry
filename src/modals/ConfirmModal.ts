import { App, Modal, Setting } from "obsidian";

export class ConfirmModal extends Modal {
  constructor(
    app: App,
    private titleText: string,
    private message: string,
    private onConfirm: () => void,
    private confirmText = "confirm",
    private cancelText = "cancel"
  ) {
    super(app);
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl("h2", { text: this.titleText });
    contentEl.createEl("p", { text: this.message });

    new Setting(contentEl)
      .addButton((btn) =>
        btn.setButtonText(this.cancelText).onClick(() => this.close())
      )
      .addButton((btn) =>
        btn
          .setCta()
          .setButtonText(this.confirmText)
          .onClick(() => {
            this.onConfirm();
            this.close();
          })
      );
  }

  onClose() {
    this.contentEl.empty();
  }
}
