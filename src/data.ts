import { normalizePath, TAbstractFile, TFile } from "obsidian";
import MemryPlugin from "./main";
import { randomUUID } from "crypto";

const SRS_DATA_VERSION = 1;
const DEFAULT_SRS_DATA: SRSData = {
  metadata: {
    version: SRS_DATA_VERSION,
    updatedAt: Date.now(),
  },
  notes: {},
  sets: {},
};

export interface NoteState {
  setId: string;
  lastReview: number | null;
  nextReview: number;
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
}

export interface SetState {
  name: string;
  description: string;
  createdAt: number;
}

export interface SRSData {
  metadata: {
    version: number;
    updatedAt: number;
  };
  notes: Record<string, NoteState>;
  sets: Record<string, SetState>;
}

export class DataStore {
  plugin: MemryPlugin;
  public srsData: SRSData = DEFAULT_SRS_DATA;

  constructor(plugin: MemryPlugin) {
    this.plugin = plugin;
  }

  async load() {
    const data = await this.plugin.loadData();
    if (!data?.srsData) {
      this.srsData = DEFAULT_SRS_DATA;
      await this.plugin.saveData({
        settings: this.plugin.settings,
        srsData: this.srsData,
      });
      return;
    }
    this.srsData = data.srsData;
  }

  async save() {
    await this.plugin.saveData({
      settings: this.plugin.settings,
      srsData: this.srsData,
    });
  }

  getAllData() {
    return this.srsData;
  }

  async upsertNote(id: string, updated: NoteState) {
    this.srsData.notes[id] = updated;
    this.srsData.metadata.updatedAt = Date.now();
    await this.save();
  }

  async deleteNote(id: string) {
    delete this.srsData.notes[id];
    this.srsData.metadata.updatedAt = Date.now();
    await this.save();
  }

  async createSet(name: string, description: string = "") {
    let id: string = randomUUID().toString();
    while (!!this.srsData.sets[id]) {
      id = randomUUID().toString();
    }
    this.srsData.sets[id] = {
      name,
      description,
      createdAt: Date.now(),
    };
    await this.save();
    return id;
  }
}
