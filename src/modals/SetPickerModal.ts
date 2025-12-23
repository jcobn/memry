import { App, SuggestModal } from "obsidian";
import { SetState } from "src/managers/DataManager";

export class SetPickerModal extends SuggestModal<string> {
  constructor(
    app: App,
    private sets: Record<string, SetState>,
    private onChoose: (setId: string) => Promise<void> | void
  ) {
    super(app);
    this.setPlaceholder("choose a set...");
  }

  getSuggestions(query: string): string[] {
    return Object.keys(this.sets).filter((id) =>
      this.sets[id].name.toLowerCase().includes(query.toLowerCase())
    );
  }

  renderSuggestion(setId: string, el: HTMLElement) {
    el.createEl("div", { text: this.sets[setId].name });
    el.createEl("small", {
      text: this.sets[setId].description ?? "",
      cls: "srs-set-desc",
    });
  }

  onChooseSuggestion(setId: string) {
    this.onChoose(setId);
  }
}
