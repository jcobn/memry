import { DAY_TO_MILLIS } from "../Dashboard";
import { DataManager, NoteState } from "./DataManager";
import MemryPlugin from "../main";
import { randomUUID } from "crypto";

const INITIAL_STABILITY = 1.0;
const INITIAL_DIFFICULTY = 5.0;

export class NoteManager {
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

  async createSet(name: string, description: string | null = null) {
    let id: string = randomUUID().toString();
    while (!!this.store.srsData.sets[id]) {
      id = randomUUID().toString();
    }
    this.store.srsData.sets[id] = {
      name,
      description: null,
      createdAt: Date.now(),
    };
    if (!!description) this.store.srsData.sets[id].description = description;
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


  public async markAsLearned(nr: Record<string, NoteState>) {
    const path: string = Object.keys(nr)[0];
    const note = Object.values(nr)[0];
    this.store.srsData.notes[path].lastReview = Date.now();
    this.store.srsData.notes[path].nextReview = Date.now() + DAY_TO_MILLIS;
    note.reps += 1;

    await this.save();
  }

  public async trackNote(path: string, setId: string): Promise<boolean> {
    if (!!this.store.srsData.notes[path]) return false;
    if (!this.store.srsData.sets[setId]) return false;
    const newNote: NoteState = {
      setId,
      lastReview: null,
      nextReview: Date.now(), //redundant here
      stability: INITIAL_STABILITY,
      difficulty: INITIAL_DIFFICULTY,
      reps: 0,
    };
    this.store.srsData.notes[path] = newNote;
    await this.save();
    return true;
  }

  
}