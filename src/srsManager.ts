import { DAY_TO_MILLIS } from "./dashboard";
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
    await this.save();
  }

  async deleteNote(id: string) {
    delete this.store.srsData.notes[id];
    await this.save();
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
    await this.save();
    return id;
  }

  public getAllNotes() {
    return this.store.srsData.notes;
  }

  public getAllSets() {
    return this.store.srsData.sets;
  }

  private async save() {
    this.store.srsData.metadata.updatedAt = Date.now();
    await this.store.save();
  }

  public getNoteName(path: string) {
    const ar = path.split("/");
    const l = ar.length;
    return ar[l - 1];
  }

  public async markAsLearned(nr: Record<string, NoteState>) {
    const path: string = Object.keys(nr)[0];
    const note = Object.values(nr)[0];
    this.store.srsData.notes[path].lastReview = Date.now();
    this.store.srsData.notes[path].nextReview = Date.now() + DAY_TO_MILLIS;
    note.reps += 1;
    note.lapses = 0;

    await this.save();
  }
}
