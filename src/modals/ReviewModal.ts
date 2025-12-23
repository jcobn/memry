import { ButtonComponent, Modal, TFile } from "obsidian";
import MemryPlugin from "src/main";
import { NoteState } from "src/managers/DataManager";
import { errorNotice } from "src/utils/notice";
import { getNoteName, getScheduledNoteState, Rating } from "src/utils/srsLogic";

export enum ReviewPhase {
  RECALL = 1,
  RATE = 2,
  DONE = 3,
}

export class ReviewModal extends Modal {
  private plugin: MemryPlugin;
  private note: NoteState;
  private path: string;
  public phase: ReviewPhase;

  constructor(plugin: MemryPlugin, n: { path: string; note: NoteState }) {
    super(plugin.app);
    this.plugin = plugin;
    this.note = n.note;
    this.path = n.path;
    this.phase = ReviewPhase.RECALL;
  }

  onOpen(): void {
    if (this.phase === ReviewPhase.DONE) return;
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", {
      text: `note review`,
    });

    if (this.phase === ReviewPhase.RATE) {
      this.phase = ReviewPhase.DONE;
      contentEl.createEl("h5", {
        text: this.getNoteLabel(),
      });
      contentEl.createEl("p", {
        text: "rate your recall for " + getNoteName(this.path),
      });
      const buttons = contentEl.createEl("div", { cls: "srs-review-buttons" });
      const makeBtn = (label: string, rating: Rating) => {
        new ButtonComponent(buttons).setButtonText(label).onClick(async () => {
          const ns = getScheduledNoteState(this.note, rating);
          await this.plugin.noteManager.upsertNote(this.path, ns);
          this.plugin.rerenderStatusBar();
          this.close();
        });
      };

      makeBtn("again", Rating.AGAIN);
      makeBtn("hard", Rating.HARD);
      makeBtn("good", Rating.GOOD);
      makeBtn("easy", Rating.EASY);
      return;
    }

    contentEl.createEl("h5", {
      text: this.getNoteLabel(),
    });

    contentEl.createEl("p", {
      text: "try to recall " + getNoteName(this.path),
    });

    const buttons = contentEl.createEl("div", { cls: "srs-review-buttons" });
    new ButtonComponent(buttons).setButtonText("go to note").onClick(() => {
      this.close();
      const tfile = this.plugin.app.vault.getAbstractFileByPath(this.path);
      if (tfile instanceof TFile) {
        this.plugin.app.workspace.getLeaf("tab").openFile(tfile);
        this.phase = ReviewPhase.RATE;
      } else errorNotice(this.path + " not instance of TFile");
    });
    /*const buttons = contentEl.createEl("div", { cls: "srs-review-buttons" });

    const makeBtn = (label: string, rating: Rating) => {
      new ButtonComponent(buttons)
        .setButtonText(label)
        .onClick(() => {
          console.log(rating);
          this.close();
        })
        .setClass("srs-review-" + rating);
    };

    makeBtn("again", Rating.AGAIN);
    makeBtn("hard", Rating.HARD);
    makeBtn("good", Rating.GOOD);
    makeBtn("easy", Rating.EASY);*/
  }

  private getNoteLabel() {
    return `${getNoteName(this.path)} 🎯 ${
      this.plugin.dataManager.srsData.sets[this.note.setId]?.name
    }`;
  }

}
