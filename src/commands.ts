import MemryPlugin from "./main";
import { CreateSetModal } from "./modals/CreateSetModal";
import { SetPickerModal } from "./modals/SetPickerModal";
import { memryNotice } from "./utils/notice";
import { NotePickerModal } from "./modals/NotePickerModal";

export default class Commands {
  plugin: MemryPlugin;

  constructor(plugin: MemryPlugin) {
    this.plugin = plugin;
  }

  addCommands() {
    const plugin = this.plugin;

    plugin.addCommand({
      id: "create-set",
      name: "create a set",
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
    plugin.addCommand({
      id: "move-note",
      name: "move note into a different set",
      callback: () => {
        new NotePickerModal(
          this.plugin,
          this.plugin.dataManager.srsData.notes,
          (path) => {
            new SetPickerModal(
              plugin.app,
              this.plugin.dataManager.srsData.sets,
              async (setId) => {
                const ns = this.plugin.dataManager.srsData.notes[path];
                ns.setId = setId;
                await this.plugin.noteManager.upsertNote(path, ns);
              }
            ).open();
          }
        ).open();
      },
    });
    plugin.addCommand({
      id: "delete-set",
      name: "delete a set",
      callback: () => {
        new SetPickerModal(
          this.plugin.app,
          this.plugin.dataManager.srsData.sets,
          async (setId) => {
            const did = await this.plugin.noteManager.deleteSet(setId);
            if (!did)
              memryNotice("could not delete set because it isn't empty");
            else memryNotice("deleted set");
          }
        ).open();
      },
    });
  }
}
