import MemryPlugin from "src/main";
import { ReviewModal, ReviewPhase } from "src/modals/ReviewModal";
import { memryNotice } from "src/utils/notice";
import { getReviewQueue } from "src/utils/srsLogic";
import { NoteState } from "./DataManager";

export class ReviewManager {
  plugin: MemryPlugin;
  modal: ReviewModal | null;
  queue: { path: string; note: NoteState }[];

  constructor(plugin: MemryPlugin) {
    this.plugin = plugin;
    this.modal = null;
  }

  public startReview(): void {
    this.queue = getReviewQueue(this.plugin.dataManager.srsData.notes);
    if (this.modal === null) {
      if (this.queue.length === 0)
        return memryNotice("no notes to review today");
      else this.newNoteReview();
    } else if (this.modal.phase === ReviewPhase.RATE) {
      this.modal.open();
    } else {
      if (this.queue.length === 0)
        return memryNotice("no notes to review today");
      else this.newNoteReview();
    }
  }

  private newNoteReview(): void {
    this.modal = new ReviewModal(this.plugin, this.queue[0]);
    this.modal.open();
  }
}
