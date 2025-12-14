import { DataManager, NoteState } from "./dataManager";
import MemryPlugin from "./main";
import { randomUUID } from "crypto";

export class SRSManager {
  plugin: MemryPlugin;
  store: DataManager;

  constructor(plugin: MemryPlugin) {
    this.plugin = plugin;
    this.store = plugin.dataManager;
  }

  async upsertNote(id: string, updated: NoteState) {
    this.store.srsData.notes[id] = updated;
    this.store.srsData.metadata.updatedAt = Date.now();
    await this.store.save();
  }

  async deleteNote(id: string) {
    delete this.store.srsData.notes[id];
    this.store.srsData.metadata.updatedAt = Date.now();
    await this.store.save();
  }

  async createSet(name: string, description: string = "") {
    let id: string = randomUUID().toString();
    while (!!this.store.srsData.sets[id]) {
      id = randomUUID().toString();
    }
    this.store.srsData.sets[id] = {
      name,
      description,
      createdAt: Date.now(),
    };
    await this.store.save();
    return id;
  }
}
