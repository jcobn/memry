import { SuggestModal } from "obsidian";
import MemryPlugin from "src/main";
import { NoteState } from "src/managers/DataManager";
import { getNoteName } from "src/utils/srsLogic";

export class NotePickerModal extends SuggestModal<string> {
  plugin: MemryPlugin;
  constructor(
    plugin: MemryPlugin,
    private notes: Record<string, NoteState>,
    private onChoose: (path: string) => Promise<void> | void
  ) {
    super(plugin.app);
    this.plugin = plugin;
    this.setPlaceholder("choose a note...");
  }

  getSuggestions(query: string): string[] {
    return Object.keys(this.notes).filter((id) =>
      getNoteName(id).toLowerCase().includes(query.toLowerCase())
    );
  }

  renderSuggestion(path: string, el: HTMLElement) {
    el.createEl("div", { text: getNoteName(path) });
    el.createEl("small", {
      text:
        this.plugin.dataManager.srsData.sets[this.notes[path].setId].name ?? "",
      cls: "srs-set-desc",
    });
  }

  onChooseSuggestion(path: string) {
    this.onChoose(path);
  }
}
