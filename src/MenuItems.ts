import { Menu, MenuItem, TFile, TFolder } from "obsidian";
import MemryPlugin from "./main";
import { errorNotice, memryNotice } from "./utils/notice";
import { getNoteName } from "./utils/srsLogic";
import { ConfirmModal } from "./modals/ConfirmModal";

export class MenuItems {
  private plugin: MemryPlugin;

  constructor(plugin: MemryPlugin) {
    this.plugin = plugin;
  }

  public init() {
    this.plugin.registerEvent(
      this.plugin.app.workspace.on("file-menu", (menu, file) => {
        if (!(file instanceof TFile) && file instanceof TFolder) {
          this.allFilesAction(menu, FolderAction.ADD, file);
          this.allFilesAction(menu, FolderAction.REMOVE, file);
          return;
        }

        if (this.plugin.noteManager.store.srsData.notes[file.path]) {
          menu.addItem((item) => {
            item
              .setTitle("remove from memry")
              .setIcon("trash")
              .onClick((_) => {
                new ConfirmModal(
                  this.plugin.app,
                  "remove " + getNoteName(file.path) + "?",
                  "are you sure you want to remove this note from memry? all of the srs data will be lost.",
                  async () => {
                    await this.plugin.noteManager.deleteNote(file.path);
                    memryNotice("successfully removed note");
                  }
                ).open();
              });
          });
          return;
        }
        menu.addItem((item) => {
          item.setTitle("add to memry").setIcon("graduation-cap");

          const subMenu = (item as any).setSubmenu();

          for (const [setId, set] of Object.entries(
            this.plugin.dataManager.srsData.sets
          )) {
            subMenu.addItem((i: MenuItem) => {
              i.setTitle(set.name);
              i.onClick(async () => {
                if (await this.plugin.noteManager.trackNote(file.path, setId)) {
                  memryNotice(`added file ${getNoteName(file.path)}`);
                } else {
                  errorNotice("couldn't add to memry");
                }
              });
            });
          }
        });
      })
    );
  }

  private allFilesAction(menu: Menu, action: FolderAction, file: TFolder) {
    menu.addItem((item) => {
      item
        .setTitle(
          action === FolderAction.ADD
            ? "add all subfiles to memry"
            : "remove all subfiles from memry"
        )
        .setIcon("graduation-cap");

      if (action === FolderAction.REMOVE) {
        item.onClick(async (_) => {
          new ConfirmModal(
            this.plugin.app,
            "remove all subfiles",
            "are you sure you want to remove all the subfiles of " +
              file.name +
              " from memry?",
            async () => {
              let ct = 0;
              for (const ch of file.children) {
                if (!(ch instanceof TFile)) continue;
                if (await this.plugin.noteManager.deleteNote(ch.path)) ct++;
              }
              memryNotice("removed " + ct + " notes from memry");
            }
          ).open();
        });
        return;
      }
      const subMenu = (item as any).setSubmenu();

      for (const [setId, set] of Object.entries(
        this.plugin.dataManager.srsData.sets
      )) {
        subMenu.addItem((i: MenuItem) => {
          i.setTitle(set.name);
          i.onClick(async () => {
            let ct = 0;
            for (const ch of file.children) {
              if (!(ch instanceof TFile)) continue;
              if (await this.plugin.noteManager.trackNote(ch.path, setId)) ct++;
            }
            memryNotice("added " + ct + " files to memry");
            return;
          });
        });
      }
    });
  }
}

enum FolderAction {
  ADD = 1,
  REMOVE = 0,
}
