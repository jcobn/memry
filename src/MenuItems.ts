import { MenuItem, Notice, TFile } from "obsidian";
import MemryPlugin from "./main";
import { errorNotice, memryNotice } from "./utils/notice";

export class MenuItems {
  private plugin: MemryPlugin;

  constructor(plugin: MemryPlugin) {
    this.plugin = plugin;
  }

  public init() {
    this.plugin.registerEvent(
      this.plugin.app.workspace.on("file-menu", (menu, file) => {
        //TODO: for folders too
        if (!(file instanceof TFile)) return;

        if (!!this.plugin.noteManager.store.srsData.notes[file.path]) {
          //TODO: do the logic to remove files?
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
                  memryNotice(
                    `added file ${this.plugin.noteManager.getNoteName(
                      file.path
                    )}`
                  );
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
}
