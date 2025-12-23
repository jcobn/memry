import { Modal } from "obsidian";
import MemryPlugin from "./main";
import { CreateSetModal } from "./modals/CreateSetModal";
import { getReviewQueue } from "./utils/srsLogic";
import { ReviewModal } from "./modals/ReviewModal";

export default class Commands {
  plugin: MemryPlugin;
  modal: ReviewModal;

  constructor(plugin: MemryPlugin) {
    this.plugin = plugin;
  }

  addCommands() {
    const plugin = this.plugin;

    plugin.addCommand({
      id: "load",
      name: "Load (dev)",
      callback: async () => {
        await this.plugin.dataManager.init();
      },
    });

    plugin.addCommand({
      id: "create-set",
      name: "create new set",
      callback: () => {
        new CreateSetModal(this.plugin).open();
      },
    });
    plugin.addCommand({
      id: "review",
      name: "review notes",
      callback: () => {
        this.plugin.reviewManager.startReview();
      },
    });
  }
}
